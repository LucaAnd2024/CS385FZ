from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy.orm import Session

from models.score import ScoreRecord
from schemas.score import Score


def list_scores(db: Session) -> List[ScoreRecord]:
    return db.query(ScoreRecord).order_by(ScoreRecord.created_at.desc()).all()


def get_score_by_uuid(db: Session, uuid: str) -> Optional[ScoreRecord]:
    return db.query(ScoreRecord).filter(ScoreRecord.uuid == uuid).first()


def create_score(db: Session, score: Score) -> Tuple[Optional[ScoreRecord], Optional[str]]:
    uuid = str(score.id)
    exists = get_score_by_uuid(db, uuid)
    if exists:
        return None, "Score already exists"
    rec = ScoreRecord(uuid=uuid, title=score.title, data=score.model_dump())
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec, None


def update_score(db: Session, uuid: str, score: Score) -> Optional[ScoreRecord]:
    rec = get_score_by_uuid(db, uuid)
    if not rec:
        return None
    rec.title = score.title
    rec.data = score.model_dump()
    db.commit()
    db.refresh(rec)
    return rec


def delete_score(db: Session, uuid: str) -> bool:
    rec = get_score_by_uuid(db, uuid)
    if not rec:
        return False
    db.delete(rec)
    db.commit()
    return True
