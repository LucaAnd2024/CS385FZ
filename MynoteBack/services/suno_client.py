"""
Suno API 客户端
负责调用 Suno API 生成音乐
"""

import asyncio
import httpx
from typing import Dict, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class SunoAPIError(Exception):
    """Suno API 错误"""
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(f"Suno API Error {code}: {message}")


class SunoClient:
    """Suno API 客户端"""
    
    def __init__(self, api_key: str, base_url: str = "https://api.sunoapi.org"):
        """
        初始化 Suno 客户端
        
        Args:
            api_key: Suno API Key
            base_url: API 基础 URL
        """
        self.api_key = api_key
        self.base_url = base_url
        self.timeout = httpx.Timeout(60.0, connect=10.0)
        
        logger.info(f"[SunoClient] 初始化完成，Base URL: {base_url}")
    
    async def generate_music(
        self,
        prompt: str,
        style: str,
        title: str,
        custom_mode: bool = True,
        instrumental: bool = True,
        model: str = "V4_5",
        style_weight: float = 0.65,
        weirdness_constraint: float = 0.5,
        negative_tags: Optional[str] = None,
        callback_url: Optional[str] = None
    ) -> str:
        """
        调用 Suno API 生成音乐
        
        Args:
            prompt: 音乐描述
            style: 音乐风格
            title: 音乐标题
            custom_mode: 是否使用自定义模式
            instrumental: 是否为纯音乐
            model: 模型版本
            style_weight: 风格权重 (0-1)
            weirdness_constraint: 创意度约束 (0-1)
            negative_tags: 负面标签
            callback_url: 回调 URL
            
        Returns:
            taskId: 任务 ID
            
        Raises:
            SunoAPIError: API 调用失败
        """
        url = f"{self.base_url}/api/v1/generate"
        
        # 构建请求体
        payload = {
            "prompt": prompt,
            "style": style,
            "title": title,
            "customMode": custom_mode,
            "instrumental": instrumental,
            "model": model,
            "styleWeight": style_weight,
            "weirdnessConstraint": weirdness_constraint
        }
        
        # 添加可选参数
        if negative_tags:
            payload["negativeTags"] = negative_tags
        
        if callback_url:
            payload["callBackUrl"] = callback_url
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        logger.info(f"[SunoClient] 🎵 开始生成音乐")
        logger.info(f"[SunoClient] 标题: {title}")
        logger.info(f"[SunoClient] 风格: {style}")
        logger.info(f"[SunoClient] Prompt 长度: {len(prompt)} 字符")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                
                # 检查响应状态
                if response.status_code != 200:
                    error_data = response.json() if response.text else {}
                    error_msg = error_data.get("msg", "Unknown error")
                    
                    logger.error(f"[SunoClient] ❌ API 调用失败: {response.status_code}")
                    logger.error(f"[SunoClient] 错误信息: {error_msg}")
                    
                    raise SunoAPIError(response.status_code, error_msg)
                
                # 解析响应
                result = response.json()
                
                # 检查响应格式
                if result.get("code") != 200:
                    error_msg = result.get("msg", "Unknown error")
                    logger.error(f"[SunoClient] ❌ 业务错误: {error_msg}")
                    raise SunoAPIError(result.get("code", 500), error_msg)
                
                # 获取 taskId
                task_id = result.get("data", {}).get("taskId")
                
                if not task_id:
                    logger.error(f"[SunoClient] ❌ 响应中无 taskId: {result}")
                    raise SunoAPIError(500, "响应中缺少 taskId")
                
                logger.info(f"[SunoClient] ✅ 任务创建成功，Task ID: {task_id}")
                
                return task_id
                
        except httpx.TimeoutException:
            logger.error("[SunoClient] ❌ 请求超时")
            raise SunoAPIError(504, "请求超时")
        except httpx.RequestError as e:
            logger.error(f"[SunoClient] ❌ 网络错误: {str(e)}")
            raise SunoAPIError(503, f"网络错误: {str(e)}")
    
    async def query_task(self, task_id: str) -> Dict:
        """
        查询任务状态（使用Suno API的record-info接口）
        
        Args:
            task_id: 任务 ID
            
        Returns:
            任务状态信息
            {
                "taskId": "xxx",
                "status": "SUCCESS|PENDING|...",
                "musicUrl": "https://...",
                "duration": 180
            }
            
        Raises:
            SunoAPIError: 查询失败
        """
        # 注意：taskId 是 query 参数，不是 path 参数
        url = f"{self.base_url}/api/v1/generate/record-info"
        params = {"taskId": task_id}
        
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        logger.debug(f"[SunoClient] 查询任务状态: {task_id}")
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers, params=params)
                
                if response.status_code != 200:
                    error_data = response.json() if response.text else {}
                    error_msg = error_data.get("msg", "Unknown error")
                    raise SunoAPIError(response.status_code, error_msg)
                
                result = response.json()
                
                # 检查业务状态码
                if result.get("code") != 200:
                    error_msg = result.get("msg", "Unknown error")
                    raise SunoAPIError(result.get("code", 500), error_msg)
                
                # 解析数据
                data = result.get("data", {})
                if not data:
                    logger.warning(f"[SunoClient] ⚠️ 响应中无data字段: {result}")
                    raise SunoAPIError(500, "响应格式异常")
                
                status = data.get("status", "PENDING")
                
                # 提取音乐信息（从 response.sunoData 中获取）
                response_data = data.get("response")
                music_url = None
                duration = None
                
                if response_data and isinstance(response_data, dict):
                    suno_data_list = response_data.get("sunoData", [])
                    
                    # 获取第一首音乐的信息
                    if suno_data_list and len(suno_data_list) > 0:
                        first_music = suno_data_list[0]
                        music_url = first_music.get("audioUrl")
                        duration = first_music.get("duration")
                
                logger.debug(f"[SunoClient] 任务状态: {status}")
                
                # 映射Suno的状态到我们的状态
                our_status = self._map_suno_status(status)
                
                return {
                    "taskId": task_id,
                    "status": our_status,
                    "musicUrl": music_url,
                    "duration": int(duration) if duration else None,
                    "createdAt": None,  # Suno API未返回此字段
                    "finishedAt": None,
                    "failedReason": data.get("errorMessage")
                }
                
        except httpx.TimeoutException:
            logger.error(f"[SunoClient] ❌ 查询超时: {task_id}")
            raise SunoAPIError(504, "查询超时")
        except httpx.RequestError as e:
            logger.error(f"[SunoClient] ❌ 查询失败: {str(e)}")
            raise SunoAPIError(503, f"网络错误: {str(e)}")
    
    def _map_suno_status(self, suno_status: str) -> str:
        """
        映射Suno的状态到我们的状态
        
        Suno状态：
        - PENDING: 等待中
        - TEXT_SUCCESS: 文本生成完成
        - FIRST_SUCCESS: 第一首完成
        - SUCCESS: 全部完成
        - CREATE_TASK_FAILED: 任务创建失败
        - GENERATE_AUDIO_FAILED: 音频生成失败
        - CALLBACK_EXCEPTION: 回调异常
        - SENSITIVE_WORD_ERROR: 敏感词错误
        """
        status_map = {
            "PENDING": "queued",
            "TEXT_SUCCESS": "running",
            "FIRST_SUCCESS": "streaming",
            "SUCCESS": "succeeded",
            "CREATE_TASK_FAILED": "failed",
            "GENERATE_AUDIO_FAILED": "failed",
            "CALLBACK_EXCEPTION": "failed",
            "SENSITIVE_WORD_ERROR": "failed"
        }
        
        return status_map.get(suno_status, "running")
    
    async def poll_until_complete(
        self,
        task_id: str,
        max_wait_seconds: int = 300,  # 最多等待 5 分钟
        initial_interval: int = 5,     # 初始轮询间隔 5 秒
        max_interval: int = 20         # 最大轮询间隔 20 秒
    ) -> Dict:
        """
        轮询直到任务完成（使用指数退避策略）
        
        Args:
            task_id: 任务 ID
            max_wait_seconds: 最大等待时间（秒）
            initial_interval: 初始轮询间隔（秒）
            max_interval: 最大轮询间隔（秒）
            
        Returns:
            任务结果（包含 musicUrl 等）
            
        Raises:
            SunoAPIError: 任务失败
            TimeoutError: 超时
        """
        elapsed = 0
        current_interval = initial_interval
        
        logger.info(f"[SunoClient] 🔄 开始轮询任务: {task_id}")
        logger.info(f"[SunoClient] 最大等待时间: {max_wait_seconds}秒")
        
        while elapsed < max_wait_seconds:
            # 查询任务状态
            result = await self.query_task(task_id)
            status = result["status"]
            
            logger.info(f"[SunoClient] 📊 轮询进度: {elapsed}/{max_wait_seconds}秒，状态: {status}")
            
            # 检查状态
            if status == "succeeded":
                logger.info(f"[SunoClient] ✅ 任务完成！音乐 URL: {result.get('musicUrl')}")
                return result
            
            elif status == "failed":
                reason = result.get("failedReason", "Unknown reason")
                logger.error(f"[SunoClient] ❌ 任务失败: {reason}")
                raise SunoAPIError(500, f"音乐生成失败: {reason}")
            
            elif status in ["queued", "running", "reviewing", "streaming"]:
                # 任务进行中，继续等待
                logger.debug(f"[SunoClient] ⏳ 任务进行中，等待 {current_interval} 秒后重试")
                await asyncio.sleep(current_interval)
                elapsed += current_interval
                
                # 指数退避：逐渐增加轮询间隔
                current_interval = min(current_interval + 5, max_interval)
            
            else:
                # 未知状态
                logger.warning(f"[SunoClient] ⚠️ 未知状态: {status}，继续等待")
                await asyncio.sleep(current_interval)
                elapsed += current_interval
        
        # 超时
        logger.error(f"[SunoClient] ❌ 轮询超时: {task_id}，已等待 {elapsed} 秒")
        raise TimeoutError(f"任务 {task_id} 超时（{max_wait_seconds}秒）")
    
    async def health_check(self) -> bool:
        """
        健康检查
        
        Returns:
            bool: 服务是否可用
        """
        try:
            # Suno API 可能没有专门的健康检查端点
            # 这里简单验证 API Key 的有效性
            # 可以尝试查询一个不存在的任务，如果返回 404 说明服务可用
            
            url = f"{self.base_url}/api/v1/query/health_check_dummy"
            headers = {"Authorization": f"Bearer {self.api_key}"}
            
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0)) as client:
                response = await client.get(url, headers=headers)
                
                # 如果返回 404 说明服务可用但任务不存在（正常）
                # 如果返回 401 说明 API Key 无效
                if response.status_code in [200, 404]:
                    logger.info("[SunoClient] ✅ 健康检查通过")
                    return True
                elif response.status_code == 401:
                    logger.error("[SunoClient] ❌ API Key 无效")
                    return False
                else:
                    logger.warning(f"[SunoClient] ⚠️ 健康检查异常: {response.status_code}")
                    return False
                    
        except Exception as e:
            logger.error(f"[SunoClient] ❌ 健康检查失败: {str(e)}")
            return False


class SunoClientFactory:
    """Suno 客户端工厂（单例模式）"""
    
    _instance: Optional[SunoClient] = None
    _api_key: Optional[str] = None
    
    @classmethod
    def get_client(cls, api_key: Optional[str] = None) -> SunoClient:
        """
        获取 Suno 客户端实例
        
        Args:
            api_key: API Key（首次调用时必须提供）
            
        Returns:
            SunoClient 实例
        """
        if cls._instance is None:
            if api_key is None:
                raise ValueError("首次调用必须提供 api_key")
            
            cls._api_key = api_key
            cls._instance = SunoClient(api_key=api_key)
            logger.info("[SunoClientFactory] 创建新的 Suno 客户端实例")
        
        return cls._instance
    
    @classmethod
    def reset(cls):
        """重置客户端实例（用于测试）"""
        cls._instance = None
        cls._api_key = None


# 错误码映射表（用于前端友好提示）
ERROR_CODE_MAP = {
    400: "请求参数错误，请检查输入",
    401: "API Key 无效或已过期",
    404: "请求的资源不存在",
    405: "调用次数超过限制",
    413: "提示词过长",
    429: "积分不足或请求过于频繁",
    430: "调用频率过高，请稍后再试",
    455: "服务维护中",
    500: "Suno 服务异常",
    503: "网络连接失败",
    504: "请求超时"
}


def get_user_friendly_error(error: SunoAPIError) -> str:
    """
    获取用户友好的错误提示
    
    Args:
        error: Suno API 错误
        
    Returns:
        用户友好的错误信息
    """
    base_message = ERROR_CODE_MAP.get(error.code, "未知错误")
    return f"{base_message}（错误码：{error.code}）"

