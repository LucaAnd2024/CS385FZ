from sqlalchemy import Column, Integer, String, DateTime, func, UniqueConstraint
from sqlalchemy.types import JSON
from config import Base


class EmotionDay(Base):
    __tablename__ = "emotion_days"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(32), nullable=False, unique=True, index=True)  # 格式: yyyy-MM-dd
    data = Column(JSON, nullable=False)  # 存储完整 JSON

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("date", name="uq_emotion_days_date"),
    )
