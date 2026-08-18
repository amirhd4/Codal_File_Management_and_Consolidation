import os
import glob
import openpyxl
import pandas as pd
from typing import Dict, Any, Optional
from app.core.config import settings

class ExcelUnprotectService:
    def __init__(self, source_dir: Optional[str] = None, target_dir: Optional[str] = None):
        self.source_dir = source_dir or settings.DOWNLOADS_DIR
        self.target_dir = target_dir or settings.UNPROTECTED_DIR
        os.makedirs(self.target_dir, exist_ok=True)

    def unprotect_all(self) -> Dict[str, Any]:
        pattern = os.path.join(self.source_dir, "*.[xX][lL][sS]*")
        files = glob.glob(pattern)
        results = {"total": len(files), "processed": 0, "failed": 0, "processed_files": [], "errors": []}

        for file_path in files:
            filename = os.path.basename(file_path)
            target_path = os.path.join(self.target_dir, filename)
            if filename.lower().endswith('.xls') and not filename.lower().endswith('.xlsx'):
                target_path = os.path.splitext(target_path)[0] + '.xlsx'

            try:
                self.unprotect_single_file(file_path, target_path)
                results["processed"] += 1
                results["processed_files"].append({"original": filename, "target_path": target_path, "status": "unprotected"})
            except Exception as e:
                results["failed"] += 1
                results["errors"].append({"original": filename, "error": str(e)})

        return results

    def unprotect_single_file(self, source_path: str, target_path: str) -> str:
        if source_path.lower().endswith('.xlsx'):
            try:
                wb = openpyxl.load_workbook(source_path, data_only=True)
                if wb.security:
                    wb.security.lockStructure = False
                    wb.security.lockWindows = False
                for ws in wb.worksheets:
                    ws.protection.sheet = False
                    ws.protection.password = None
                wb.save(target_path)
                return target_path
            except Exception:
                pass

        xls_file = pd.ExcelFile(source_path)
        with pd.ExcelWriter(target_path, engine='openpyxl') as writer:
            for sheet_name in xls_file.sheet_names:
                df = pd.read_excel(xls_file, sheet_name=sheet_name, header=None)
                df.to_excel(writer, sheet_name=sheet_name, index=False, header=False)

        return target_path