from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.core.database import Base

class Fund(Base):
    __tablename__ = "funds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    codal_url = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)