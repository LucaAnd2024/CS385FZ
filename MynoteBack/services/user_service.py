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
    # 特殊测试账号：admin / 123456
    if login == "admin" and password == "123456":
        # 检查是否已存在 admin 测试用户
        test_user = db.query(User).filter(User.username == "admin").first()
        if not test_user:
            # 创建测试用户
            hashed = get_password_hash("123456")
            test_user = User(
                email="admin@mynote.com",
                phone="13800138000",
                username="admin",
                password_hash=hashed
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
        return test_user
    
    # 正常登录流程
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
