from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Response
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.schemas import FundCreate, FundUpdate, FundResponse
from app.services.fund_service import FundService

router = APIRouter(prefix="/funds", tags=["funds"])

@router.get("/", response_model=List[FundResponse])
def get_funds(db: Session = Depends(get_db)):
    service = FundService(db)
    return service.list_funds()

@router.post("/", response_model=FundResponse)
def create_fund(fund: FundCreate, db: Session = Depends(get_db)):
    service = FundService(db)
    return service.create_fund(fund)

@router.put("/{fund_id}", response_model=FundResponse)
def update_fund(fund_id: int, fund: FundUpdate, db: Session = Depends(get_db)):
    service = FundService(db)
    try:
        return service.update_fund(fund_id, fund)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{fund_id}")
def delete_fund(fund_id: int, db: Session = Depends(get_db)):
    service = FundService(db)
    success = service.delete_fund(fund_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fund not found")
    return {"message": "Fund deleted successfully"}

@router.get("/export/excel")
def export_funds_excel(db: Session = Depends(get_db)):
    service = FundService(db)
    excel_bytes = service.export_to_excel()
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=funds_list.xlsx"}
    )

@router.post("/import/excel", response_model=List[FundResponse])
async def import_funds_excel(
    file: UploadFile = File(...),
    replace_existing: bool = Query(False),
    db: Session = Depends(get_db)
):
    service = FundService(db)
    contents = await file.read()
    try:
        return service.import_from_excel(contents, replace_existing=replace_existing)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))