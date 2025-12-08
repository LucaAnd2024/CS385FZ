from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config import get_db
from schemas.emotion import EmotionDayData, EmotionEvent, EmotionDayOut, MusicStatusUpdate
from services.emotion_service import (
    list_days,
    get_day_by_date,
    upsert_day,
    delete_day,
    add_event,
    update_event,
    delete_event,
    update_music_generation,
)
from services.response import success, error

router = APIRouter(prefix="/emotions", tags=["emotions"])


@router.get("/days")
def list_emotion_days(db: Session = Depends(get_db)):
    items = list_days(db)
    data: List[EmotionDayData] = [EmotionDayData(**it.data) for it in items]
    return success(data=[d.model_dump() for d in data])


@router.get("/days/{date}")
def get_emotion_day(date: str, db: Session = Depends(get_db)):
    obj = get_day_by_date(db, date)
    if not obj:
        return error(code=2001, message="Emotion day not found")
    return success(data=EmotionDayData(**obj.data).model_dump())


@router.put("/days")
def upsert_emotion_day(payload: EmotionDayData, db: Session = Depends(get_db)):
    obj = upsert_day(db, payload)
    return success(data=EmotionDayData(**obj.data).model_dump())


@router.delete("/days/{date}")
def delete_emotion_day(date: str, db: Session = Depends(get_db)):
    ok = delete_day(db, date)
    if not ok:
        return error(code=2002, message="Delete failed or not found")
    return success(data=True)


@router.post("/days/{date}/events")
def add_emotion_event(date: str, payload: EmotionEvent, db: Session = Depends(get_db)):
    obj = add_event(db, date, payload)
    if not obj:
        return error(code=2003, message="Add event failed")
    return success(data=EmotionDayData(**obj.data).model_dump())


@router.put("/days/{date}/events/{event_id}")
def update_emotion_event(date: str, event_id: UUID, payload: EmotionEvent, db: Session = Depends(get_db)):
    obj = update_event(db, date, event_id, payload)
    if not obj:
        return error(code=2004, message="Update event failed or not found")
    return success(data=EmotionDayData(**obj.data).model_dump())


@router.delete("/days/{date}/events/{event_id}")
def delete_emotion_event(date: str, event_id: UUID, db: Session = Depends(get_db)):
    obj = delete_event(db, date, event_id)
    if not obj:
        return error(code=2005, message="Delete event failed or not found")
    return success(data=EmotionDayData(**obj.data).model_dump())


@router.patch("/days/{date}/music")
def patch_music_status(date: str, payload: MusicStatusUpdate, db: Session = Depends(get_db)):
    obj = update_music_generation(db, date, prompt=payload.prompt, generated=payload.generated)
    if not obj:
        return error(code=2006, message="Update music status failed or not found")
    return success(data=EmotionDayData(**obj.data).model_dump())
