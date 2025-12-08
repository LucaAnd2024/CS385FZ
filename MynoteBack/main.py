from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import (
    Base,
    engine,
    CORS_ORIGINS,
    CORS_ALLOW_CREDENTIALS,
    CORS_ALLOW_METHODS,
    CORS_ALLOW_HEADERS,
)

# 导入模型以确保在创建表时被注册
import models.user  # noqa: F401
import models.emotion  # noqa: F401
import models.score  # noqa: F401
import models.music_task  # noqa: F401

# 路由
from routers.users import router as users_router
from routers.emotions import router as emotions_router
from routers.scores import router as scores_router
from routers.ai import router as ai_router
from routers.music import router as music_router


app = FastAPI(title="Mynote Backend", version="0.1.0")

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=CORS_ALLOW_METHODS,
    allow_headers=CORS_ALLOW_HEADERS,
)


@app.on_event("startup")
def on_startup():
    # 初始化数据库表
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    """根路径欢迎页面"""
    return {
        "service": "Mynote Backend API",
        "version": "0.1.0",
        "status": "running",
        "endpoints": {
            "health": "/ping",
            "docs": "/docs",
            "users": "/users",
            "emotions": "/emotions",
            "scores": "/scores",
            "ai": "/ai",
            "music": "/music"
        }
    }


@app.get("/ping")
def ping():
    # 健康检查
    return {"message": "pong"}


# 挂载路由
app.include_router(users_router)
app.include_router(emotions_router)
app.include_router(scores_router)
app.include_router(ai_router)
app.include_router(music_router)


# ============================================
# 启动服务器（支持 Railway 云端部署）
# ============================================
if __name__ == "__main__":
    import uvicorn
    import os
    
    # Railway 会自动提供 PORT 环境变量
    port = int(os.getenv("PORT", 8000))
    
    print(f"🚀 Starting Mynote Backend on port {port}...")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # 允许外部访问
        port=port,
        reload=False,    # 生产环境关闭热重载
    )
