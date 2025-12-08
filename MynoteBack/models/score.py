from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.types import JSON
from config import Base


class ScoreRecord(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String(36), unique=True, index=True, nullable=False)  # 与前端 Score.id 对齐
    title = Column(String(255), nullable=True)
    data = Column(JSON, nullable=False)  # 完整 Score JSON

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
