from __future__ import annotations

from fastapi import APIRouter, Depends

from schemas.ai import ChatRoundInput, ChatTextInput, ChatOutput
from services.ai_service import get_ai_question, get_ai_response
from services.response import success

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/question")
def get_question(params: ChatRoundInput = Depends()):
    text = get_ai_question(params.round)
    return success(data=ChatOutput(text=text).model_dump())


@router.post("/response")
def post_response(payload: ChatTextInput):
    text = get_ai_response(payload.round, user_text=payload.userText, context=payload.context)
    return success(data=ChatOutput(text=text).model_dump())
