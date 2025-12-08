from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class ChatRoundInput(BaseModel):
    round: int = Field(default=1, ge=1)
    context: Optional[str] = None


class ChatTextInput(BaseModel):
    round: int = Field(default=1, ge=1)
    userText: Optional[str] = None
    context: Optional[str] = None


class ChatOutput(BaseModel):
    text: str
