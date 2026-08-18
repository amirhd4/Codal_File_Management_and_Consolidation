from sqlalchemy.orm import Session
from app.domain.models import Fund
from app.domain.schemas import FundCreate, FundUpdate
from typing import List, Optional

class FundRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 1000) -> List[Fund]:
        return self.db.query(Fund).offset(skip).limit(limit).all()

    def get_by_id(self, fund_id: int) -> Optional[Fund]:
        return self.db.query(Fund).filter(Fund.id == fund_id).first()

    def create(self, fund: FundCreate) -> Fund:
        db_fund = Fund(name=fund.name, codal_url=fund.codal_url)
        self.db.add(db_fund)
        self.db.commit()
        self.db.refresh(db_fund)
        return db_fund

    def update(self, fund_id: int, fund_update: FundUpdate) -> Optional[Fund]:
        db_fund = self.get_by_id(fund_id)
        if not db_fund:
            return None
        if fund_update.name is not None:
            db_fund.name = fund_update.name
        if fund_update.codal_url is not None:
            db_fund.codal_url = fund_update.codal_url
        self.db.commit()
        self.db.refresh(db_fund)
        return db_fund

    def delete(self, fund_id: int) -> bool:
        db_fund = self.get_by_id(fund_id)
        if not db_fund:
            return False
        self.db.delete(db_fund)
        self.db.commit()
        return True

    def bulk_create(self, funds_data: List[FundCreate]) -> List[Fund]:
        funds = [Fund(name=f.name, codal_url=f.codal_url) for f in funds_data]
        self.db.add_all(funds)
        self.db.commit()
        for f in funds:
            self.db.refresh(f)
        return funds

    def clear_all(self):
        self.db.query(Fund).delete()
        self.db.commit()