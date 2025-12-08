from __future__ import annotations

from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from models.emotion import EmotionDay
from schemas.emotion import EmotionDayData, EmotionEvent


# -------- EmotionDay 基础 CRUD --------

def list_days(db: Session) -> List[EmotionDay]:
    return db.query(EmotionDay).order_by(EmotionDay.date.desc()).all()


def get_day_by_date(db: Session, date: str) -> Optional[EmotionDay]:
    return db.query(EmotionDay).filter(EmotionDay.date == date).first()


def upsert_day(db: Session, day_data: EmotionDayData) -> EmotionDay:
    obj = get_day_by_date(db, day_data.date)
    data_dict = day_data.model_dump()
    if obj:
        obj.data = data_dict
    else:
        obj = EmotionDay(date=day_data.date, data=data_dict)
        db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_day(db: Session, date: str) -> bool:
    obj = get_day_by_date(db, date)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# -------- EmotionEvent 操作（基于 JSON 内部列表） --------

def add_event(db: Session, date: str, event: EmotionEvent) -> Optional[EmotionDay]:
    obj = get_day_by_date(db, date)
    if not obj:
        # 如果不存在该日期，自动创建
        day = EmotionDayData(date=date, events=[event], finalPrompt=None, musicGenerated=False)
        return upsert_day(db, day)

    cur = EmotionDayData(**obj.data)
    cur.events.append(event)
    obj.data = cur.model_dump()
    db.commit()
    db.refresh(obj)
    return obj


def update_event(db: Session, date: str, event_id: UUID, new_event: EmotionEvent) -> Optional[EmotionDay]:
    obj = get_day_by_date(db, date)
    if not obj:
        return None
    cur = EmotionDayData(**obj.data)
    replaced = False
    for idx, e in enumerate(cur.events):
        if e.id == event_id:
            cur.events[idx] = new_event
            replaced = True
            break
    if not replaced:
        return None
    obj.data = cur.model_dump()
    db.commit()
    db.refresh(obj)
    return obj


def delete_event(db: Session, date: str, event_id: UUID) -> Optional[EmotionDay]:
    obj = get_day_by_date(db, date)
    if not obj:
        return None
    cur = EmotionDayData(**obj.data)
    before = len(cur.events)
    cur.events = [e for e in cur.events if e.id != event_id]
    if len(cur.events) == before:
        return None
    obj.data = cur.model_dump()
    db.commit()
    db.refresh(obj)
    return obj


def update_music_generation(db: Session, date: str, *, prompt: Optional[str], generated: bool) -> Optional[EmotionDay]:
    obj = get_day_by_date(db, date)
    if not obj:
        return None
    cur = EmotionDayData(**obj.data)
    cur.finalPrompt = prompt
    cur.musicGenerated = generated
    obj.data = cur.model_dump()
    db.commit()
    db.refresh(obj)
    return obj
