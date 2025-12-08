"""
音乐生成路由
提供音乐生成、查询、回调等接口
"""

from __future__ import annotations

import os
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from config import get_db
from models.music_task import MusicTask
from schemas.music import (
    DailyMusicRequest,
    WeeklyMusicRequest,
    MusicTaskResponse,
    MusicQueryResponse,
    SunoCallback
)
from services.music_mapper import emotion_mapper
from services.suno_client import SunoClient, SunoClientFactory, SunoAPIError, get_user_friendly_error
from services.response import success, error

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/music", tags=["music"])


# ============================================
# Suno API 配置
# ============================================

def get_suno_client() -> SunoClient:
    """获取 Suno 客户端实例"""
    api_key = os.getenv("SUNO_API_KEY")
    
    if not api_key:
        logger.error("[MusicRouter] ❌ SUNO_API_KEY 未配置")
        raise HTTPException(status_code=500, detail="Suno API 未配置")
    
    return SunoClientFactory.get_client(api_key=api_key)


# ============================================
# API 路由
# ============================================

@router.post("/generate-daily", response_model=dict)
async def generate_daily_music(
    request: DailyMusicRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    生成单日音乐
    
    流程：
    1. 情绪映射 → Suno 参数
    2. 调用 Suno API 创建任务
    3. 保存任务到数据库
    4. 后台轮询任务状态
    """
    logger.info(f"[MusicRouter] 📥 收到单日音乐生成请求，日期: {request.date}")
    logger.info(f"[MusicRouter] 情绪事件数: {len(request.emotions)}")
    
    try:
        # 1. 情绪映射
        suno_params = emotion_mapper.map_emotions_to_suno_params(
            emotions=request.emotions,
            daily_summary=request.dailySummary
        )
        
        logger.info(f"[MusicRouter] ✅ 情绪映射完成")
        logger.info(f"[MusicRouter] 音乐标题: {suno_params.title}")
        logger.info(f"[MusicRouter] 音乐风格: {suno_params.style}")
        
        # 2. 调用 Suno API
        suno_client = get_suno_client()
        
        # 设置回调 URL
        # 注意：Suno API 要求必须提供 callBackUrl
        # 开发环境：使用占位符URL（Suno会尝试回调但失败，我们用轮询）
        # 生产环境：使用真实的公网URL
        callback_url = os.getenv("SUNO_CALLBACK_URL")
        if not callback_url:
            # 开发环境占位符（Suno会尝试回调但失败，不影响功能）
            callback_url = "https://placeholder.example.com/callback"
            logger.info("[MusicRouter] ⚠️ 使用占位符回调URL（开发模式）")
        
        task_id = await suno_client.generate_music(
            prompt=suno_params.prompt,
            style=suno_params.style,
            title=suno_params.title,
            custom_mode=suno_params.customMode,
            instrumental=suno_params.instrumental,
            model=suno_params.model,
            style_weight=suno_params.styleWeight,
            weirdness_constraint=suno_params.weirdnessConstraint,
            negative_tags=suno_params.negativeTags,
            callback_url=callback_url
        )
        
        logger.info(f"[MusicRouter] ✅ Suno 任务创建成功，Task ID: {task_id}")
        
        # 3. 保存到数据库
        music_task = MusicTask(
            task_id=task_id,
            date=request.date,
            task_type="daily",
            status="queued",
            suno_params=suno_params.model_dump()
        )
        
        db.add(music_task)
        db.commit()
        db.refresh(music_task)
        
        logger.info(f"[MusicRouter] ✅ 任务已保存到数据库，ID: {music_task.id}")
        
        # 4. 后台轮询任务状态（如果没有配置回调）
        if not callback_url:
            background_tasks.add_task(
                poll_task_status,
                task_id=task_id,
                db_session=SessionLocal()
            )
            logger.info(f"[MusicRouter] 🔄 已启动后台轮询任务")
        
        # 5. 返回响应
        return success(data={
            "taskId": task_id,
            "status": "queued",
            "message": "任务已创建，正在生成中"
        })
        
    except SunoAPIError as e:
        logger.error(f"[MusicRouter] ❌ Suno API 错误: {e}")
        user_message = get_user_friendly_error(e)
        return error(code=5001, message=user_message)
    
    except Exception as e:
        logger.error(f"[MusicRouter] ❌ 生成失败: {str(e)}", exc_info=True)
        return error(code=5000, message=f"音乐生成失败: {str(e)}")


@router.post("/generate-weekly", response_model=dict)
async def generate_weekly_music(
    request: WeeklyMusicRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    生成周音乐
    
    流程类似 generate-daily，但使用周汇总数据
    """
    logger.info(f"[MusicRouter] 📥 收到周音乐生成请求")
    logger.info(f"[MusicRouter] 时间范围: {request.startDate} - {request.endDate}")
    
    try:
        # 1. 情绪映射
        suno_params = emotion_mapper.map_weekly_emotions_to_suno(
            weekly_summary=request.weeklySummary,
            daily_data=request.dailyData
        )
        
        logger.info(f"[MusicRouter] ✅ 周情绪映射完成")
        logger.info(f"[MusicRouter] 音乐标题: {suno_params.title}")
        
        # 2. 调用 Suno API
        suno_client = get_suno_client()
        
        # 设置回调 URL（同 generate-daily）
        callback_url = os.getenv("SUNO_CALLBACK_URL")
        if not callback_url:
            callback_url = "https://placeholder.example.com/callback"
            logger.info("[MusicRouter] ⚠️ 使用占位符回调URL（开发模式）")
        
        task_id = await suno_client.generate_music(
            prompt=suno_params.prompt,
            style=suno_params.style,
            title=suno_params.title,
            custom_mode=suno_params.customMode,
            instrumental=suno_params.instrumental,
            model=suno_params.model,
            style_weight=suno_params.styleWeight,
            weirdness_constraint=suno_params.weirdnessConstraint,
            callback_url=callback_url
        )
        
        logger.info(f"[MusicRouter] ✅ 周音乐任务创建成功，Task ID: {task_id}")
        
        # 3. 保存到数据库（使用 startDate 作为 date）
        music_task = MusicTask(
            task_id=task_id,
            date=request.startDate,
            task_type="weekly",
            status="queued",
            suno_params=suno_params.model_dump()
        )
        
        db.add(music_task)
        db.commit()
        db.refresh(music_task)
        
        # 4. 后台轮询（如果没有回调）
        if not callback_url:
            background_tasks.add_task(
                poll_task_status,
                task_id=task_id,
                db_session=SessionLocal()
            )
        
        return success(data={
            "taskId": task_id,
            "status": "queued",
            "message": "周音乐任务已创建"
        })
        
    except SunoAPIError as e:
        logger.error(f"[MusicRouter] ❌ Suno API 错误: {e}")
        return error(code=5001, message=get_user_friendly_error(e))
    
    except Exception as e:
        logger.error(f"[MusicRouter] ❌ 周音乐生成失败: {str(e)}", exc_info=True)
        return error(code=5000, message=f"周音乐生成失败: {str(e)}")


@router.get("/query/{task_id}", response_model=dict)
async def query_music_task(
    task_id: str,
    db: Session = Depends(get_db)
):
    """
    查询音乐生成任务状态
    
    逻辑：
    1. 先从数据库查询
    2. 如果状态不是终态（succeeded/failed），则查询 Suno API
    3. 更新数据库并返回
    """
    logger.info(f"[MusicRouter] 📊 查询任务状态: {task_id}")
    
    # 1. 从数据库查询
    music_task = db.query(MusicTask).filter(MusicTask.task_id == task_id).first()
    
    if not music_task:
        logger.warning(f"[MusicRouter] ⚠️ 任务不存在: {task_id}")
        return error(code=4004, message="任务不存在")
    
    # 2. 如果已完成或失败，直接返回缓存结果
    if music_task.status in ["succeeded", "failed"]:
        logger.info(f"[MusicRouter] ✅ 返回缓存结果，状态: {music_task.status}")
        return success(data={
            "taskId": music_task.task_id,
            "status": music_task.status,
            "musicUrl": music_task.music_url,
            "duration": music_task.duration,
            "createdAt": music_task.created_at.isoformat() if music_task.created_at else None,
            "finishedAt": music_task.finished_at.isoformat() if music_task.finished_at else None
        })
    
    # 3. 查询 Suno API 获取最新状态
    try:
        suno_client = get_suno_client()
        result = await suno_client.query_task(task_id)
        
        # 4. 更新数据库
        music_task.status = result["status"]
        
        if result["status"] == "succeeded":
            music_task.music_url = result.get("musicUrl")
            music_task.duration = result.get("duration")
            music_task.finished_at = datetime.utcnow()
            logger.info(f"[MusicRouter] ✅ 任务完成！音乐 URL: {result.get('musicUrl')}")
        
        db.commit()
        db.refresh(music_task)
        
        return success(data={
            "taskId": music_task.task_id,
            "status": music_task.status,
            "musicUrl": music_task.music_url,
            "duration": music_task.duration,
            "createdAt": music_task.created_at.isoformat() if music_task.created_at else None,
            "finishedAt": music_task.finished_at.isoformat() if music_task.finished_at else None
        })
        
    except SunoAPIError as e:
        logger.error(f"[MusicRouter] ❌ 查询失败: {e}")
        return error(code=5002, message=get_user_friendly_error(e))
    
    except Exception as e:
        logger.error(f"[MusicRouter] ❌ 查询异常: {str(e)}", exc_info=True)
        return error(code=5000, message=f"查询失败: {str(e)}")


@router.post("/callback", response_model=dict)
async def suno_callback(
    callback: SunoCallback,
    db: Session = Depends(get_db)
):
    """
    Suno API 回调接口
    
    当音乐生成完成时，Suno 会调用此接口
    """
    logger.info(f"[MusicRouter] 📞 收到 Suno 回调，Task ID: {callback.taskId}")
    logger.info(f"[MusicRouter] 回调阶段: {callback.stage}")
    
    try:
        # 1. 查找任务
        music_task = db.query(MusicTask).filter(
            MusicTask.task_id == callback.taskId
        ).first()
        
        if not music_task:
            logger.warning(f"[MusicRouter] ⚠️ 回调任务不存在: {callback.taskId}")
            return error(code=4004, message="任务不存在")
        
        # 2. 更新任务状态
        if callback.stage == "complete":
            music_task.status = "succeeded"
            music_task.music_url = callback.data.audioUrl
            music_task.duration = callback.data.duration
            music_task.finished_at = datetime.utcnow()
            
            logger.info(f"[MusicRouter] ✅ 任务完成（回调），音乐 URL: {callback.data.audioUrl}")
        
        elif callback.stage == "failed":
            music_task.status = "failed"
            music_task.finished_at = datetime.utcnow()
            
            logger.error(f"[MusicRouter] ❌ 任务失败（回调）")
        
        else:
            # 中间状态（text, first 等）
            logger.info(f"[MusicRouter] 📊 中间回调阶段: {callback.stage}")
        
        db.commit()
        
        return success(data={"status": "ok"})
        
    except Exception as e:
        logger.error(f"[MusicRouter] ❌ 回调处理失败: {str(e)}", exc_info=True)
        return error(code=5000, message=f"回调处理失败: {str(e)}")


# ============================================
# 后台任务
# ============================================

from sqlalchemy.orm import sessionmaker
from config import engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def poll_task_status(task_id: str, db_session: Session):
    """
    后台轮询任务状态（在没有回调时使用）
    
    Args:
        task_id: 任务 ID
        db_session: 数据库会话
    """
    logger.info(f"[BackgroundTask] 🔄 开始轮询任务: {task_id}")
    
    try:
        suno_client = get_suno_client()
        
        # 轮询直到完成（最多 5 分钟）
        result = await suno_client.poll_until_complete(
            task_id=task_id,
            max_wait_seconds=300
        )
        
        # 更新数据库
        music_task = db_session.query(MusicTask).filter(
            MusicTask.task_id == task_id
        ).first()
        
        if music_task:
            music_task.status = "succeeded"
            music_task.music_url = result.get("musicUrl")
            music_task.duration = result.get("duration")
            music_task.finished_at = datetime.utcnow()
            
            db_session.commit()
            
            logger.info(f"[BackgroundTask] ✅ 轮询完成，任务成功")
        
    except TimeoutError:
        logger.error(f"[BackgroundTask] ⏰ 轮询超时: {task_id}")
        
        # 标记为超时
        music_task = db_session.query(MusicTask).filter(
            MusicTask.task_id == task_id
        ).first()
        
        if music_task:
            music_task.status = "timeouted"
            music_task.finished_at = datetime.utcnow()
            db_session.commit()
    
    except Exception as e:
        logger.error(f"[BackgroundTask] ❌ 轮询失败: {str(e)}", exc_info=True)
    
    finally:
        db_session.close()


# ============================================
# 辅助接口
# ============================================

@router.get("/health")
async def health_check():
    """健康检查"""
    try:
        suno_client = get_suno_client()
        is_healthy = await suno_client.health_check()
        
        return success(data={
            "status": "healthy" if is_healthy else "unhealthy",
            "suno_api": "available" if is_healthy else "unavailable"
        })
    except Exception as e:
        logger.error(f"[MusicRouter] ❌ 健康检查失败: {str(e)}")
        return error(code=5003, message="健康检查失败")

