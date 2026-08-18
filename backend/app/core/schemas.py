from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class FundBase(BaseModel):
    name: str
    codal_url: str

class FundCreate(FundBase):
    pass

class FundUpdate(BaseModel):
    name: Optional[str] = None
    codal_url: Optional[str] = None

class FundResponse(FundBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ConsolidationConfig(BaseModel):
    download_dir: Optional[str] = None
    unprotect_dir: Optional[str] = None
    output_dir: Optional[str] = None
    selected_sheets: List[str] = ["سهام"]