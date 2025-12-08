"""
音乐生成相关的数据模型定义
用于 Suno API 集成
"""

from __future__ import annotations
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


# ============================================
# 请求模型（Request Schemas）
# ============================================

class EmotionEventData(BaseModel):
    """单个情绪事件数据"""
    emotion: str = Field(..., description="情绪类型，如 Joy, Sadness, Anger 等")
    intensity: float = Field(..., ge=0.0, le=1.0, description="情绪强度，范围 0.0-1.0")
    time: str = Field(..., description="时间，格式 HH:MM，如 '09:30'")
    event: str = Field(..., description="事件描述")
    hr: Optional[int] = Field(None, description="心率（BPM）")
    hrv: Optional[int] = Field(None, description="心率变异性（HRV）")
    steps: Optional[int] = Field(None, description="步数")
    calories: Optional[int] = Field(None, description="卡路里")


class DailySummary(BaseModel):
    """每日汇总数据"""
    dominantEmotion: str = Field(..., description="主导情绪")
    emotionDistribution: Dict[str, float] = Field(..., description="情绪分布，如 {'Joy': 0.6, 'Sad': 0.4}")
    overallMood: str = Field(..., description="整体情绪描述，如 '积极', '波动较大'")
    avgHeartRate: int = Field(..., description="平均心率")
    avgHRV: Optional[int] = Field(None, description="平均 HRV")
    totalSteps: int = Field(..., description="总步数")
    sleepHours: Optional[float] = Field(None, description="睡眠时长（小时）")
    activeMinutes: Optional[int] = Field(None, description="活动分钟数")


class DailyMusicRequest(BaseModel):
    """生成单日音乐请求"""
    date: str = Field(..., description="日期，格式 YYYY-MM-DD")
    emotions: List[EmotionEventData] = Field(..., description="情绪事件列表")
    dailySummary: DailySummary = Field(..., description="每日汇总数据")
    
    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-10-14",
                "emotions": [
                    {
                        "emotion": "Joy",
                        "intensity": 0.8,
                        "time": "09:00",
                        "event": "晨跑",
                        "hr": 120,
                        "steps": 3000
                    },
                    {
                        "emotion": "Calm",
                        "intensity": 0.6,
                        "time": "14:00",
                        "event": "工作",
                        "hr": 75,
                        "steps": 500
                    }
                ],
                "dailySummary": {
                    "dominantEmotion": "Joy",
                    "emotionDistribution": {"Joy": 0.7, "Calm": 0.3},
                    "overallMood": "积极",
                    "avgHeartRate": 82,
                    "totalSteps": 8500
                }
            }
        }


class DailySummaryData(BaseModel):
    """周音乐生成时的单日汇总数据（简化版）"""
    date: str = Field(..., description="日期，格式 YYYY-MM-DD")
    dominantEmotion: str = Field(..., description="主导情绪")
    eventCount: int = Field(..., description="事件数量")
    avgHeartRate: int = Field(..., description="平均心率")
    totalSteps: int = Field(..., description="总步数")


class WeeklySummary(BaseModel):
    """周汇总数据"""
    mostFrequentEmotion: str = Field(..., description="本周最频繁的情绪")
    emotionDistribution: Dict[str, float] = Field(..., description="一周的情绪分布")
    emotionTrend: str = Field(..., description="情绪趋势，如 '上升', '下降', '平稳'")
    weeklyMood: str = Field(..., description="整体周情绪")
    avgDailyEvents: int = Field(..., description="平均每日事件数")


class WeeklyMusicRequest(BaseModel):
    """生成周音乐请求"""
    startDate: str = Field(..., description="开始日期，格式 YYYY-MM-DD")
    endDate: str = Field(..., description="结束日期，格式 YYYY-MM-DD")
    dailyData: List[DailySummaryData] = Field(..., description="一周的每日数据")
    weeklySummary: WeeklySummary = Field(..., description="周汇总数据")


# ============================================
# 响应模型（Response Schemas）
# ============================================

class MusicTaskResponse(BaseModel):
    """音乐生成任务响应"""
    taskId: str = Field(..., description="任务 ID，用于查询任务状态")
    status: str = Field(..., description="任务状态，如 queued, running, succeeded, failed")
    message: Optional[str] = Field(None, description="提示消息")
    
    class Config:
        json_schema_extra = {
            "example": {
                "taskId": "5c79be8e",
                "status": "queued",
                "message": "任务已创建，正在生成中"
            }
        }


class MusicQueryResponse(BaseModel):
    """音乐任务查询响应"""
    taskId: str = Field(..., description="任务 ID")
    status: str = Field(..., description="任务状态")
    musicUrl: Optional[str] = Field(None, description="音乐 URL（仅在 succeeded 时存在）")
    duration: Optional[int] = Field(None, description="音乐时长（秒）")
    createdAt: Optional[str] = Field(None, description="创建时间")
    finishedAt: Optional[str] = Field(None, description="完成时间")
    failedReason: Optional[str] = Field(None, description="失败原因（仅在 failed 时存在）")
    
    class Config:
        json_schema_extra = {
            "example": {
                "taskId": "5c79be8e",
                "status": "succeeded",
                "musicUrl": "https://cdn.suno.ai/xxx.mp3",
                "duration": 180,
                "createdAt": "2025-10-14T10:30:00Z",
                "finishedAt": "2025-10-14T10:35:00Z"
            }
        }


# ============================================
# 回调模型（Callback Schemas）
# ============================================

class SunoCallbackData(BaseModel):
    """Suno API 回调数据"""
    audioUrl: str = Field(..., description="音频文件 URL")
    duration: int = Field(..., description="音频时长（秒）")
    stage: Optional[str] = Field(None, description="回调阶段，如 text, first, complete")


class SunoCallback(BaseModel):
    """Suno API 回调请求"""
    taskId: str = Field(..., description="任务 ID")
    stage: str = Field(..., description="回调阶段")
    data: SunoCallbackData = Field(..., description="回调数据")


# ============================================
# 内部模型（Internal Models）
# ============================================

class SunoGenerationParams(BaseModel):
    """Suno API 生成参数（内部使用）"""
    prompt: str = Field(..., description="音乐描述 prompt")
    style: str = Field(..., description="音乐风格")
    title: str = Field(..., description="音乐标题")
    customMode: bool = Field(True, description="是否使用自定义模式")
    instrumental: bool = Field(True, description="是否为纯音乐")
    model: str = Field("V4_5", description="模型版本")
    styleWeight: float = Field(0.65, ge=0.0, le=1.0, description="风格权重")
    weirdnessConstraint: float = Field(0.5, ge=0.0, le=1.0, description="创意度约束")
    negativeTags: Optional[str] = Field(None, description="需要排除的音乐风格")


# ============================================
# 数据库模型输出（用于持久化）
# ============================================

class MusicTaskOut(BaseModel):
    """音乐任务数据库输出"""
    id: int
    task_id: str
    date: str
    status: str
    music_url: Optional[str]
    duration: Optional[int]
    suno_params: Optional[Dict]
    created_at: str
    finished_at: Optional[str]
    
    class Config:
        from_attributes = True


