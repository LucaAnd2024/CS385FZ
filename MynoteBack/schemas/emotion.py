from __future__ import annotations

from typing import List, Optional
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, ConfigDict


class EmotionNote(BaseModel):
    pitch: str
    duration: float
    velocity: float


class EmotionEvent(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    time: str
    hr: int
    hrv: int
    triggered: bool
    userInput: str
    emotion: str
    phrase: List[EmotionNote]

    # 兼容 AI 对话可选字段
    conversationId: Optional[UUID] = None
    aiTriggered: Optional[bool] = False
    conversationSummary: Optional[str] = None


class EmotionDayData(BaseModel):
    date: str  # yyyy-MM-dd
    events: List[EmotionEvent]
    finalPrompt: Optional[str] = None
    musicGenerated: bool = False


class EmotionDayOut(EmotionDayData):
    model_config = ConfigDict(from_attributes=True)


class EmotionDayUpsert(EmotionDayData):
    pass


class MusicStatusUpdate(BaseModel):
    prompt: Optional[str] = None
    generated: bool
