from typing import Optional, Tuple
from sqlalchemy.orm import Session

from models.user import User
from services.security import get_password_hash, verify_password


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
    return db.query(User).filter(User.phone == phone).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    *,
    email: Optional[str],
    phone: Optional[str],
    username: Optional[str],
    password: str,
) -> Tuple[Optional[User], Optional[str]]:
    if email:
        exists = get_user_by_email(db, email)
        if exists:
            return None, "Email already registered"
    if phone:
        exists = get_user_by_phone(db, phone)
        if exists:
            return None, "Phone already registered"

    hashed = get_password_hash(password)
    user = User(email=email, phone=phone, username=username, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, None


def authenticate_user(db: Session, *, login: str, password: str) -> Optional[User]:
    user = None
    if "@" in login:
        user = get_user_by_email(db, login)
    if not user:
        user = get_user_by_phone(db, login)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
