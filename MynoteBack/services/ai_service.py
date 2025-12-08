from __future__ import annotations

from typing import Optional


# 与前端 StudioIntroViewModel 的提示语保持一致

def get_ai_question(round: int) -> str:
    if round == 1:
        return "我注意到你在12:45心率升高到了95 BPM，当时发生了什么事情吗？"
    if round == 2:
        return "看起来你今天心情不错，能分享一下是什么让你这么开心吗？"
    if round == 3:
        return "你刚才提到的那个项目，能详细说说吗？我很感兴趣。"
    if round == 4:
        return "你的故事总是那么精彩，还有什么想和我分享的吗？"
    return "我们聊得很开心呢，还有什么想说的吗？"


def get_ai_response(round: int, user_text: Optional[str] = None, context: Optional[str] = None) -> str:
    if round == 1:
        return "哇，听起来太棒了！\n美妙的风景也可以是你生命的旋律。\n我们来生成今天的音乐吧"
    if round == 2:
        return "你的心情真的很棒呢！\n每一个美好的瞬间都值得被记录。\n我们来生成今天的音乐吧"
    if round == 3:
        return "生活就像一首歌，\n有高潮也有低谷，但都很美。\n我们来生成今天的音乐吧"
    if round == 4:
        return "你的故事总是那么动人，\n让我为你谱写这美好的旋律。\n我们来生成今天的音乐吧"
    return "每一次对话都是新的开始，\n让我们继续创造美好的音乐。\n我们来生成今天的音乐吧"
