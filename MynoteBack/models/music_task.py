"""
音乐生成任务数据库模型
"""

from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.types import JSON
from config import Base


class MusicTask(Base):
    """音乐生成任务表"""
    
    __tablename__ = "music_tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String(128), unique=True, index=True, nullable=False, comment="Suno 任务 ID")
    date = Column(String(32), index=True, nullable=False, comment="日期 YYYY-MM-DD")
    task_type = Column(String(32), default="daily", comment="任务类型: daily/weekly")
    status = Column(String(32), default="queued", comment="任务状态")
    
    # 音乐信息
    music_url = Column(String(512), nullable=True, comment="音乐 URL")
    duration = Column(Integer, nullable=True, comment="时长（秒）")
    
    # Suno 参数（JSON 存储）
    suno_params = Column(JSON, nullable=True, comment="Suno 生成参数")
    
    # 时间戳
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
    
    def __repr__(self):
        return f"<MusicTask(task_id={self.task_id}, status={self.status})>"

