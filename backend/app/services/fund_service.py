import pandas as pd
import io
from typing import List, BinaryIO
from sqlalchemy.orm import Session
from app.repositories.fund_repository import FundRepository
from app.domain.schemas import FundCreate, FundResponse


class FundService:
    def __init__(self, db: Session):
        self.repo = FundRepository(db)

    def list_funds(self) -> List[FundResponse]:
        return [FundResponse.model_validate(f) for f in self.repo.get_all()]

    def create_fund(self, fund_in: FundCreate) -> FundResponse:
        fund = self.repo.create(fund_in)
        return FundResponse.model_validate(fund)

    def update_fund(self, fund_id: int, fund_in) -> FundResponse:
        fund = self.repo.update(fund_id, fund_in)
        if not fund:
            raise ValueError(f"Fund with ID {fund_id} not found")
        return FundResponse.model_validate(fund)

    def delete_fund(self, fund_id: int) -> bool:
        return self.repo.delete(fund_id)

    def export_to_excel(self) -> bytes:
        funds = self.repo.get_all()
        data = [{
            "ردیف": idx + 1,
            "نام صندوق": f.name,
            "لینک کدال": f.codal_url
        } for idx, f in enumerate(funds)]

        df = pd.DataFrame(data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='لیست صندوق‌ها')
        output.seek(0)
        return output.getvalue()

    def import_from_excel(self, file_contents: bytes, replace_existing: bool = False) -> List[FundResponse]:
        excel_file = io.BytesIO(file_contents)
        try:
            df = pd.read_excel(excel_file)
        except Exception as e:
            raise ValueError(f"خطا در خواندن فایل اکسل: {str(e)}")

        # Find column names dynamically
        name_col = None
        url_col = None
        for col in df.columns:
            str_col = str(col).strip()
            if "نام" in str_col or "صندوق" in str_col or "Name" in str_col.title():
                if not name_col:
                    name_col = col
            if "لینک" in str_col or "کدال" in str_col or "Url" in str_col.title() or "Link" in str_col.title():
                if not url_col:
                    url_col = col

        if not name_col or not url_col:
            # Fallback to first two columns
            if len(df.columns) >= 2:
                name_col = df.columns[0]
                url_col = df.columns[1]
            else:
                raise ValueError("ستون‌های نام صندوق و لینک کدال پیدا نشدند.")

        funds_to_create = []
        for _, row in df.iterrows():
            name_val = str(row[name_col]).strip() if pd.notna(row[name_col]) else ""
            url_val = str(row[url_col]).strip() if pd.notna(row[url_col]) else ""
            if name_val and url_val and name_val != "nan" and url_val != "nan":
                funds_to_create.append(FundCreate(name=name_val, codal_url=url_val))

        if replace_existing:
            self.repo.clear_all()

        created = self.repo.bulk_create(funds_to_create)
        return [FundResponse.model_validate(f) for f in created]