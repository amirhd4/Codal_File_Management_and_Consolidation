from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from app.core.database import get_db
from app.core.config import settings
from app.services.downloader_service import CodalDownloaderService
from app.services.unprotect_service import ExcelUnprotectService
from app.services.consolidation_service import ExcelConsolidationEngine
from app.core.schemas import ConsolidationConfig

router = APIRouter(prefix="/workflow", tags=["workflow"])

@router.post("/step1/download")
def execute_step1_download(db: Session = Depends(get_db)):
    try:
        service = CodalDownloaderService(db)
        results = service.download_all_latest()
        return {"step": 1, "title": "دانلود فایل‌های اکسل از کدال", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در دانلود فایل‌ها: {str(e)}")

@router.post("/step2/unprotect")
def execute_step2_unprotect():
    try:
        service = ExcelUnprotectService()
        results = service.unprotect_all()
        return {"step": 2, "title": "رفع حالت Protected View", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در رفع حالت محافظت شده: {str(e)}")

@router.get("/step3/inspect")
def execute_step3_inspect():
    try:
        engine = ExcelConsolidationEngine()
        results = engine.inspect_files_and_sheets()
        return {"step": 3, "title": "بررسی و شناسایی شیت‌های موجود", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در بررسی شیت‌ها: {str(e)}")

@router.post("/step3-4/consolidate")
def execute_consolidation(config: ConsolidationConfig):
    try:
        engine = ExcelConsolidationEngine()
        sheets = config.selected_sheets if config.selected_sheets else ["سهام"]
        results = engine.consolidate(target_sheets=sheets)
        return {"step": 4, "title": "تلفیق نهایی فایل‌ها", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"خطا در تلفیق فایل‌ها: {str(e)}")

@router.get("/download-result")
def download_consolidated_result():
    output_path = os.path.join(settings.OUTPUT_DIR, "consolidated_portfolio.xlsx")
    if not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="فایل خروجی تلفیقی یافت نشد.")
    with open(output_path, "rb") as f:
        bytes_data = f.read()
    return Response(
        content=bytes_data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=consolidated_portfolio.xlsx"}
    )

@router.post("/upload-files")
async def upload_custom_files(files: List[UploadFile] = File(...)):
    saved_files = []
    for file in files:
        target_path = os.path.join(settings.DOWNLOADS_DIR, file.filename)
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append(file.filename)
    return {"message": f"تعداد {len(saved_files)} فایل با موفقیت آپلود شد.", "files": saved_files}