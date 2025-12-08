"""
Suno API 调试脚本
用于测试和调试 Suno API 的各个功能
"""

import asyncio
import os
from dotenv import load_dotenv
from services.suno_client import SunoClient, SunoAPIError
from services.music_mapper import emotion_mapper
from schemas.music import EmotionEventData, DailySummary

# 加载环境变量
load_dotenv()

async def test_suno_api():
    """测试 Suno API 完整流程"""
    
    print("=" * 80)
    print("  Suno API 调试测试")
    print("=" * 80)
    print()
    
    # 1. 检查 API Key
    api_key = os.getenv("SUNO_API_KEY")
    if not api_key:
        print("❌ SUNO_API_KEY 未配置")
        return
    
    print(f"✅ API Key 已配置（前8位: {api_key[:8]}...）")
    print()
    
    # 2. 初始化客户端
    client = SunoClient(api_key=api_key)
    print("✅ Suno 客户端初始化完成")
    print()
    
    # 3. 准备测试数据
    print("📊 准备测试数据...")
    
    emotions = [
        EmotionEventData(
            emotion="Joy",
            intensity=0.8,
            time="09:00",
            event="早上心情不错"
        )
    ]
    
    summary = DailySummary(
        dominantEmotion="Joy",
        emotionDistribution={"Joy": 1.0},
        overallMood="积极",
        avgHeartRate=78,
        avgHRV=35,
        totalSteps=8500,
        sleepHours=None,
        activeMinutes=None
    )
    
    # 4. 情绪映射
    print("🎵 执行情绪映射...")
    suno_params = emotion_mapper.map_emotions_to_suno_params(emotions, summary)
    
    print(f"  - 标题: {suno_params.title}")
    print(f"  - 风格: {suno_params.style}")
    print(f"  - Prompt: {suno_params.prompt[:100]}...")
    print(f"  - styleWeight: {suno_params.styleWeight}")
    print(f"  - weirdnessConstraint: {suno_params.weirdnessConstraint}")
    print()
    
    # 5. 调用 Suno API 生成音乐
    print("🚀 调用 Suno API 生成音乐...")
    
    try:
        task_id = await client.generate_music(
            prompt=suno_params.prompt,
            style=suno_params.style,
            title=suno_params.title,
            custom_mode=suno_params.customMode,
            instrumental=suno_params.instrumental,
            model=suno_params.model,
            style_weight=suno_params.styleWeight,
            weirdness_constraint=suno_params.weirdnessConstraint,
            negative_tags=suno_params.negativeTags,
            callback_url="https://placeholder.example.com/callback"
        )
        
        print(f"✅ 任务创建成功！")
        print(f"   Task ID: {task_id}")
        print()
        
        # 6. 查询任务状态
        print("🔍 查询任务状态...")
        
        for i in range(3):
            print(f"\n  第 {i+1} 次查询:")
            
            try:
                result = await client.query_task(task_id)
                
                print(f"  - 状态: {result['status']}")
                print(f"  - 音乐URL: {result.get('musicUrl', 'N/A')}")
                print(f"  - 时长: {result.get('duration', 'N/A')}")
                
                if result['status'] == 'succeeded':
                    print("\n🎉 音乐生成成功！")
                    print(f"   🎵 音乐URL: {result['musicUrl']}")
                    print(f"   ⏱️  时长: {result['duration']}秒")
                    break
                elif result['status'] == 'failed':
                    print(f"\n❌ 音乐生成失败: {result.get('failedReason', 'Unknown')}")
                    break
                else:
                    print(f"  ⏳ 任务进行中，等待10秒后重试...")
                    await asyncio.sleep(10)
                    
            except Exception as e:
                print(f"  ❌ 查询失败: {str(e)}")
                print(f"     错误类型: {type(e).__name__}")
                
                # 详细错误信息
                if hasattr(e, 'code'):
                    print(f"     错误码: {e.code}")
                if hasattr(e, 'message'):
                    print(f"     错误消息: {e.message}")
                
                break
        
    except SunoAPIError as e:
        print(f"❌ Suno API 错误:")
        print(f"   错误码: {e.code}")
        print(f"   错误消息: {e.message}")
        
    except Exception as e:
        print(f"❌ 未知错误: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print()
    print("=" * 80)
    print("  测试完成")
    print("=" * 80)


if __name__ == "__main__":
    asyncio.run(test_suno_api())

