from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config import get_db
from schemas.score import Score
from services.response import success, error
from services.score_service import (
    list_scores,
    get_score_by_uuid,
    create_score,
    update_score,
    delete_score,
)

router = APIRouter(prefix="/scores", tags=["scores"])


@router.get("")
def list_all_scores(db: Session = Depends(get_db)):
    recs = list_scores(db)
    # 直接返回存储的 JSON 数据
    return success(data=[r.data for r in recs])


@router.get("/{uuid}")
def get_score(uuid: str, db: Session = Depends(get_db)):
    rec = get_score_by_uuid(db, uuid)
    if not rec:
        return error(code=2101, message="Score not found")
    return success(data=rec.data)


@router.post("")
def create_new_score(payload: Score, db: Session = Depends(get_db)):
    rec, err = create_score(db, payload)
    if err:
        return error(code=2102, message=err)
    return success(data=rec.data)


@router.put("/{uuid}")
def update_existing_score(uuid: str, payload: Score, db: Session = Depends(get_db)):
    rec = update_score(db, uuid, payload)
    if not rec:
        return error(code=2103, message="Update failed or not found")
    return success(data=rec.data)


@router.delete("/{uuid}")
def remove_score(uuid: str, db: Session = Depends(get_db)):
    ok = delete_score(db, uuid)
    if not ok:
        return error(code=2104, message="Delete failed or not found")
    return success(data=True)
