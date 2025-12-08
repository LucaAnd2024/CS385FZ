from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field, ConfigDict


class StaffEmotionNote(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    assetName: str
    colorHex: str
    staffPosition: float
    xPercent: float
    size: float


class StaffScore(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: Optional[str] = None
    notes: List[StaffEmotionNote] = []


class Score(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: Optional[str] = None
    staves: List[StaffScore] = []
    createdAt: Optional[datetime] = None


class ScoreOut(Score):
    model_config = ConfigDict(from_attributes=True)
