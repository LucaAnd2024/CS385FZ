from __future__ import annotations

from datetime import datetime
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


class StaffEmotionCategory(str, Enum):
    Joy = 'Joy'
    Anger = 'Anger'
    Sadness = 'Sadness'
    Surprise = 'Surprise'
    Digest = 'Digest'
    Fear = 'Fear'


class StaffEmotionNote(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str = ""
    assetName: str = ""
    colorHex: str = "#000000"
    staffPosition: float = 0.0
    xPercent: float = 0.0
    size: float = 1.0


class StaffScore(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: Optional[str] = None
    notes: List[StaffEmotionNote] = []


class TimeWindow(BaseModel):
    startTime: datetime
    endTime: datetime


class MusicSegmentInfo(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    timeWindow: Optional[TimeWindow] = None
    eventText: str = ""
    emotions: List[StaffEmotionCategory] = []
    audioFilePath: str = ""
    duration: float = 0.0


class Score(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    title: Optional[str] = None
    createdAt: Optional[datetime] = None
    
    # New fields
    composerText: Optional[str] = None
    arrangerText: Optional[str] = None
    coverImageName: Optional[str] = None
    dominantEmotion: Optional[str] = None
    
    musicSegments: List[MusicSegmentInfo] = []
    staves: List[StaffScore] = []
    
    # Allow storing the complex UI structure in a generic dict/json field if needed
    staffScore: Optional[Dict[str, Any]] = None


class ScoreOut(Score):
    model_config = ConfigDict(from_attributes=True)
