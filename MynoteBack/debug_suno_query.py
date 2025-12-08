"""
调试 Suno API 查询接口
尝试不同的查询路径找到正确的接口
"""

import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

async def test_query_endpoints(task_id: str):
    """测试不同的查询接口路径"""
    
    api_key = os.getenv("SUNO_API_KEY")
    base_url = "https://api.sunoapi.org"
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    # 尝试不同的查询路径
    query_paths = [
        f"/api/v1/query/{task_id}",       # 我们当前使用的
        f"/api/v1/fetch/{task_id}",       # 可能的路径1
        f"/api/v1/get/{task_id}",         # 可能的路径2
        f"/api/v1/status/{task_id}",      # 可能的路径3
        f"/api/v1/tasks/{task_id}",       # 可能的路径4
        f"/api/v1/task/{task_id}",        # 可能的路径5
        f"/api/v1/music/{task_id}",       # 可能的路径6
    ]
    
    print("=" * 80)
    print(f"  测试任务: {task_id}")
    print("=" * 80)
    print()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for path in query_paths:
            url = f"{base_url}{path}"
            print(f"🧪 测试: {path}")
            print(f"   URL: {url}")
            
            try:
                response = await client.get(url, headers=headers)
                
                print(f"   状态码: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"   ✅ 成功！这是正确的接口")
                    try:
                        data = response.json()
                        print(f"   响应数据: {data}")
                    except:
                        print(f"   响应文本: {response.text[:200]}")
                    print()
                    return path  # 找到正确的路径
                    
                elif response.status_code == 404:
                    print(f"   ❌ 404 - 接口不存在或任务不存在")
                    
                elif response.status_code == 401:
                    print(f"   ❌ 401 - API Key 无效")
                    
                else:
                    print(f"   ⚠️  其他错误: {response.status_code}")
                    try:
                        error_data = response.json()
                        print(f"   错误信息: {error_data}")
                    except:
                        print(f"   响应文本: {response.text[:200]}")
                
            except Exception as e:
                print(f"   ❌ 请求失败: {str(e)}")
            
            print()
    
    print("=" * 80)
    print("  未找到可用的查询接口")
    print("=" * 80)
    return None


if __name__ == "__main__":
    # 使用刚才创建的任务ID
    task_id = "8e696bed163af05447c08a2a5ffeee4f"
    
    print("\n📋 Suno API 查询接口调试")
    print(f"   Task ID: {task_id}")
    print()
    
    result = asyncio.run(test_query_endpoints(task_id))
    
    if result:
        print(f"\n✅ 找到正确的查询接口: {result}")
        print(f"\n💡 请更新 suno_client.py 中的查询路径")
    else:
        print(f"\n❌ 未找到可用的查询接口")
        print(f"\n💡 建议：")
        print(f"   1. 查看 Suno API 官方文档")
        print(f"   2. 联系 Suno API 支持")
        print(f"   3. 或使用轮询后台任务完成后的回调")

