from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config import get_db
from schemas.user import UserRegister, UserLogin, UserOut
from services.response import success, error
from services.user_service import (
    create_user,
    authenticate_user,
    get_user_by_id,
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register")
def register(payload: UserRegister, db: Session = Depends(get_db)):
    user, err = create_user(
        db,
        email=payload.email,
        phone=payload.phone,
        username=payload.username,
        password=payload.password,
    )
    if err:
        return error(code=1001, message=err)
    return success(data=UserOut.model_validate(user).model_dump())


@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, login=payload.login, password=payload.password)
    if not user:
        return error(code=1002, message="Invalid credentials")
    return success(data=UserOut.model_validate(user).model_dump())


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user_by_id(db, user_id)
    if not user:
        return error(code=1003, message="User not found")
    return success(data=UserOut.model_validate(user).model_dump())
