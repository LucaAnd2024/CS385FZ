from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator


class UserRegister(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    password: str = Field(min_length=6, max_length=128)

    @model_validator(mode="after")
    def check_contact(self):
        if not self.email and not self.phone:
            raise ValueError("Either email or phone must be provided")
        return self


class UserLogin(BaseModel):
    login: str
    password: str


class UserOut(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
