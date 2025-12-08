import os
from typing import Generator, List

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

# 数据库配置（默认使用 SQLite，便于本地调试）
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# CORS 配置（开发阶段默认放开，生产环境请按需收敛）
_origins = os.getenv("CORS_ORIGINS", "*")
if _origins == "*":
    CORS_ORIGINS: List[str] = ["*"]
else:
    CORS_ORIGINS = [o.strip() for o in _origins.split(",") if o.strip()]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_METHODS = ["*"]
CORS_ALLOW_HEADERS = ["*"]
