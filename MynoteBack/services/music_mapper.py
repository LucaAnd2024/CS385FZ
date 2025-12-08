"""
情绪到音乐风格映射服务
将用户的情绪数据转换为 Suno API 的音乐生成参数
"""

from typing import List, Dict, Tuple
from schemas.music import (
    EmotionEventData,
    DailySummary,
    WeeklySummary,
    SunoGenerationParams
)


class EmotionMusicMapper:
    """情绪音乐映射器"""
    
    # 情绪 → 音乐风格映射表
    EMOTION_STYLE_MAP = {
        "Joy": {
            "style": "古典钢琴, 明亮弦乐",
            "keywords": ["欢快", "轻盈", "跳跃"],
            "tempo": "中快板",
            "dynamics": "活泼明亮"
        },
        "Happy": {
            "style": "流行钢琴, 轻快旋律",
            "keywords": ["愉悦", "阳光", "欢乐"],
            "tempo": "快板",
            "dynamics": "开朗明快"
        },
        "Sadness": {
            "style": "新古典, 大提琴, 弦乐",
            "keywords": ["忧郁", "缓慢", "深沉"],
            "tempo": "慢板",
            "dynamics": "温柔深情"
        },
        "Sad": {
            "style": "钢琴独奏, 小调和弦",
            "keywords": ["悲伤", "低沉", "平静"],
            "tempo": "柔板",
            "dynamics": "轻柔低沉"
        },
        "Anger": {
            "style": "摇滚, 打击乐, 电吉他",
            "keywords": ["激烈", "强烈", "紧张"],
            "tempo": "急板",
            "dynamics": "强劲有力"
        },
        "Angry": {
            "style": "重音乐, 激烈节奏",
            "keywords": ["愤怒", "爆发", "冲突"],
            "tempo": "极快板",
            "dynamics": "强烈冲击"
        },
        "Fear": {
            "style": "实验电子, 氛围音乐",
            "keywords": ["紧张", "不安", "悬疑"],
            "tempo": "中板",
            "dynamics": "压抑紧张"
        },
        "Anxious": {
            "style": "实验音乐, 断续节奏",
            "keywords": ["焦虑", "不安", "波动"],
            "tempo": "不规则",
            "dynamics": "不稳定"
        },
        "Calm": {
            "style": "环境音乐, 新世纪, 钢琴",
            "keywords": ["平静", "舒缓", "安详"],
            "tempo": "慢板",
            "dynamics": "轻柔流畅"
        },
        "Relaxed": {
            "style": "爵士, 轻音乐",
            "keywords": ["放松", "惬意", "柔和"],
            "tempo": "中慢板",
            "dynamics": "轻松自在"
        },
        "Excited": {
            "style": "电子舞曲, 流行",
            "keywords": ["兴奋", "激动", "活力"],
            "tempo": "快板",
            "dynamics": "充满活力"
        },
        "Stressed": {
            "style": "现代古典, 紧张弦乐",
            "keywords": ["压力", "紧迫", "急促"],
            "tempo": "急板",
            "dynamics": "紧张压迫"
        },
        "Surprised": {
            "style": "爵士, 变化节奏",
            "keywords": ["惊讶", "突然", "变化"],
            "tempo": "变化多端",
            "dynamics": "跳跃起伏"
        }
    }
    
    # 时间 → 描述映射
    TIME_DESCRIPTION_MAP = {
        range(0, 6): "凌晨",
        range(6, 9): "清晨",
        range(9, 12): "上午",
        range(12, 14): "中午",
        range(14, 18): "下午",
        range(18, 20): "傍晚",
        range(20, 23): "晚上",
        range(23, 24): "深夜"
    }
    
    def map_emotions_to_suno_params(
        self,
        emotions: List[EmotionEventData],
        daily_summary: DailySummary
    ) -> SunoGenerationParams:
        """
        将情绪数组映射为 Suno API 参数
        
        Args:
            emotions: 情绪事件列表
            daily_summary: 每日汇总数据
            
        Returns:
            SunoGenerationParams: Suno API 生成参数
        """
        # 1. 提取情绪序列
        emotion_sequence = self._extract_emotion_sequence(emotions)
        
        # 2. 构建 prompt
        prompt = self._build_daily_prompt(emotion_sequence, daily_summary)
        
        # 3. 选择主导音乐风格
        dominant_emotion = daily_summary.dominantEmotion
        style = self._select_music_style(dominant_emotion, emotions)
        
        # 4. 生成标题
        title = self._generate_title(daily_summary)
        
        # 5. 计算动态参数
        style_weight = self._calculate_style_weight(emotions)
        weirdness = self._calculate_weirdness(emotions)
        
        # 6. 生成负面标签（排除不需要的风格）
        negative_tags = self._generate_negative_tags(dominant_emotion)
        
        return SunoGenerationParams(
            prompt=prompt,
            style=style,
            title=title,
            customMode=True,
            instrumental=True,
            model="V4_5",
            styleWeight=style_weight,
            weirdnessConstraint=weirdness,
            negativeTags=negative_tags
        )
    
    def map_weekly_emotions_to_suno(
        self,
        weekly_summary: WeeklySummary,
        daily_data: List
    ) -> SunoGenerationParams:
        """
        将周情绪数据映射为 Suno API 参数
        
        Args:
            weekly_summary: 周汇总数据
            daily_data: 每日汇总数据列表
            
        Returns:
            SunoGenerationParams: Suno API 生成参数
        """
        # 1. 构建周 prompt
        prompt = self._build_weekly_prompt(weekly_summary, daily_data)
        
        # 2. 选择主导风格
        dominant_emotion = weekly_summary.mostFrequentEmotion
        style = self.EMOTION_STYLE_MAP.get(
            dominant_emotion,
            {"style": "古典钢琴"}
        )["style"]
        
        # 3. 生成标题
        title = f"这一周的旋律"
        
        # 4. 周音乐参数更稳定
        return SunoGenerationParams(
            prompt=prompt,
            style=style,
            title=title,
            customMode=True,
            instrumental=True,
            model="V4_5",
            styleWeight=0.7,  # 周音乐风格权重更高
            weirdnessConstraint=0.4  # 创意度适中
        )
    
    def _extract_emotion_sequence(
        self,
        emotions: List[EmotionEventData]
    ) -> List[Tuple[str, float, str]]:
        """
        提取情绪序列（情绪、强度、时间）
        
        Returns:
            List[Tuple[emotion, intensity, time]]
        """
        sequence = []
        for emotion_data in emotions:
            sequence.append((
                emotion_data.emotion,
                emotion_data.intensity,
                emotion_data.time
            ))
        return sequence
    
    def _build_daily_prompt(
        self,
        sequence: List[Tuple[str, float, str]],
        summary: DailySummary
    ) -> str:
        """
        构建每日音乐 prompt
        
        核心逻辑：
        1. 描述情绪转换过程
        2. 加入时间节点
        3. 描述音乐变化
        """
        if not sequence:
            return "一首平静舒缓的纯音乐"
        
        # 构建情绪叙事
        narrative_parts = []
        
        for i, (emotion, intensity, time) in enumerate(sequence):
            time_desc = self._time_to_description(time)
            emotion_info = self.EMOTION_STYLE_MAP.get(emotion, {})
            emotion_keyword = emotion_info.get("keywords", ["平静"])[0]
            
            intensity_desc = self._intensity_to_description(intensity)
            
            if i == 0:
                narrative_parts.append(
                    f"从{time_desc}的{intensity_desc}{emotion_keyword}"
                )
            elif i == len(sequence) - 1:
                narrative_parts.append(
                    f"最终在{time_desc}回归{intensity_desc}{emotion_keyword}"
                )
            else:
                narrative_parts.append(
                    f"经历{time_desc}的{intensity_desc}{emotion_keyword}"
                )
        
        narrative = "，".join(narrative_parts)
        
        # 添加音乐转换描述
        musical_transition = self._generate_musical_transition(sequence)
        
        # 添加整体氛围
        overall_mood = summary.overallMood
        
        prompt = (
            f"一首纯音乐，{narrative}。"
            f"{musical_transition}"
            f"整体氛围{overall_mood}，充满情感的起伏与变化。"
        )
        
        return prompt
    
    def _build_weekly_prompt(
        self,
        weekly_summary: WeeklySummary,
        daily_data: List
    ) -> str:
        """构建周音乐 prompt"""
        
        trend = weekly_summary.emotionTrend
        dominant = weekly_summary.mostFrequentEmotion
        mood = weekly_summary.weeklyMood
        
        emotion_info = self.EMOTION_STYLE_MAP.get(dominant, {})
        keyword = emotion_info.get("keywords", ["平静"])[0]
        
        prompt = (
            f"一首描绘一周生活的纯音乐，"
            f"以{keyword}为主导情绪，"
            f"情绪趋势呈{trend}状态，"
            f"整体氛围{mood}。"
            f"音乐应该展现一周的情感波动，"
            f"从周一的开始到周日的结束，"
            f"完整呈现七天的情绪变化。"
        )
        
        return prompt
    
    def _time_to_description(self, time_str: str) -> str:
        """将时间转换为描述（如 '09:30' → '上午'）"""
        try:
            hour = int(time_str.split(":")[0])
            for time_range, description in self.TIME_DESCRIPTION_MAP.items():
                if hour in time_range:
                    return description
            return "某个时刻"
        except:
            return "某个时刻"
    
    def _intensity_to_description(self, intensity: float) -> str:
        """将强度转换为描述"""
        if intensity >= 0.8:
            return "强烈的"
        elif intensity >= 0.6:
            return "明显的"
        elif intensity >= 0.4:
            return "适度的"
        else:
            return "轻微的"
    
    def _select_music_style(
        self,
        dominant_emotion: str,
        emotions: List[EmotionEventData]
    ) -> str:
        """
        选择音乐风格
        
        ⚠️ 统一使用钢琴风格（符合五线谱概念）
        只根据情绪调整钢琴的演奏方式（明亮/忧郁/激烈等）
        """
        # 统一使用钢琴，根据情绪选择演奏风格
        piano_style_map = {
            "Joy": "明亮欢快的古典钢琴",
            "Happy": "轻快愉悦的钢琴",
            "Sadness": "忧郁深沉的钢琴独奏",
            "Sad": "缓慢悲伤的钢琴",
            "Anger": "激烈强劲的钢琴",
            "Angry": "愤怒有力的钢琴",
            "Fear": "紧张不安的钢琴",
            "Anxious": "焦虑波动的钢琴",
            "Calm": "平静舒缓的钢琴",
            "Relaxed": "放松柔和的钢琴",
            "Excited": "兴奋活力的钢琴",
            "Stressed": "压力紧迫的钢琴",
            "Surprised": "惊讶跳跃的钢琴"
        }
        
        # 统一返回钢琴风格
        return piano_style_map.get(dominant_emotion, "古典钢琴")
    
    def _generate_musical_transition(
        self,
        sequence: List[Tuple[str, float, str]]
    ) -> str:
        """生成音乐转换描述"""
        if len(sequence) < 2:
            return "音乐保持稳定的情感基调。"
        
        first_emotion = sequence[0][0]
        last_emotion = sequence[-1][0]
        
        first_info = self.EMOTION_STYLE_MAP.get(first_emotion, {})
        last_info = self.EMOTION_STYLE_MAP.get(last_emotion, {})
        
        first_tempo = first_info.get("tempo", "中板")
        last_tempo = last_info.get("tempo", "中板")
        
        first_dynamics = first_info.get("dynamics", "平稳")
        last_dynamics = last_info.get("dynamics", "平稳")
        
        transition = (
            f"音乐从{first_tempo}的节奏逐渐过渡到{last_tempo}，"
            f"情感从{first_dynamics}转变为{last_dynamics}。"
        )
        
        return transition
    
    def _calculate_style_weight(self, emotions: List[EmotionEventData]) -> float:
        """
        计算风格权重
        
        逻辑：
        - 高强度情绪 → 高权重（0.75-0.9）
        - 中等强度 → 中权重（0.6-0.75）
        - 低强度 → 低权重（0.45-0.6）
        """
        if not emotions:
            return 0.65
        
        avg_intensity = sum(e.intensity for e in emotions) / len(emotions)
        
        # 映射到 0.45-0.9 范围
        weight = 0.45 + (avg_intensity * 0.45)
        
        return round(weight, 2)
    
    def _calculate_weirdness(self, emotions: List[EmotionEventData]) -> float:
        """
        计算创意度
        
        逻辑：
        - 情绪变化频繁 → 高创意度（0.6-0.8）
        - 情绪稳定 → 低创意度（0.2-0.4）
        """
        if len(emotions) <= 1:
            return 0.3
        
        # 计算情绪转换次数
        transitions = 0
        for i in range(1, len(emotions)):
            if emotions[i].emotion != emotions[i-1].emotion:
                transitions += 1
        
        # 转换率
        transition_rate = transitions / (len(emotions) - 1)
        
        # 映射到 0.2-0.8 范围
        weirdness = 0.2 + (transition_rate * 0.6)
        
        return round(weirdness, 2)
    
    def _generate_title(self, summary: DailySummary) -> str:
        """生成音乐标题"""
        date = "今天"  # 可以从外部传入日期
        dominant = summary.dominantEmotion
        
        emotion_info = self.EMOTION_STYLE_MAP.get(dominant, {})
        keyword = emotion_info.get("keywords", ["情绪"])[0]
        
        return f"{date}的{keyword}旋律"
    
    def _generate_negative_tags(self, dominant_emotion: str) -> str:
        """
        生成负面标签（排除不需要的风格）
        
        例如：如果主导情绪是平静，就排除激烈、重金属等
        """
        negative_map = {
            "Joy": "悲伤, 沉重, 压抑",
            "Happy": "忧郁, 低沉, 阴暗",
            "Sadness": "欢快, 激烈, 喧闹",
            "Sad": "轻快, 活泼, 跳跃",
            "Anger": "温柔, 平静, 舒缓",
            "Calm": "激烈, 急促, 喧闹",
            "Anxious": "平静, 稳定, 舒缓",
            "Excited": "沉闷, 缓慢, 低沉"
        }
        
        return negative_map.get(dominant_emotion, "")


# 单例模式
emotion_mapper = EmotionMusicMapper()

