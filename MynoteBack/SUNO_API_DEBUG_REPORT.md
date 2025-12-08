# Suno API 调试报告

**日期**: 2025-10-16  
**问题**: Suno API 查询接口返回 404

---

## 🔍 问题分析

### 测试结果

#### ✅ 成功的部分

| 测试项 | 结果 | Task ID |
|--------|------|---------|
| API Key 验证 | ✅ 成功 | - |
| 音乐生成请求 | ✅ 成功 | `7d488ace62b802353393c0ada76e0861` |
| 任务创建 | ✅ 成功 | `8e696bed163af05447c08a2a5ffeee4f` |
| 后端路由 | ✅ 成功 | POST `/music/generate-daily` |
| 情绪映射 | ✅ 成功 | Prompt 生成正常 |

#### ❌ 失败的部分

| 测试项 | 结果 | 错误 |
|--------|------|------|
| 查询任务状态 | ❌ 失败 | HTTP 404 |

**已测试的查询路径（均失败）**：
- `/api/v1/query/{task_id}` → 404
- `/api/v1/fetch/{task_id}` → 404
- `/api/v1/get/{task_id}` → 404
- `/api/v1/status/{task_id}` → 404
- `/api/v1/tasks/{task_id}` → 404
- `/api/v1/task/{task_id}` → 404
- `/api/v1/music/{task_id}` → 404

---

## 💡 可能的原因

### 原因1：Suno API 采用纯回调模式

Suno API 可能：
- ✅ 提供生成接口（`/api/v1/generate`）
- ❌ **不提供查询接口**
- ✅ 仅通过回调（callback）通知任务完成

**证据**：
- `callBackUrl` 是**必需参数**（不提供会报错）
- 所有查询接口均返回 404

---

### 原因2：查询接口需要特殊格式

可能的情况：
- 需要使用 POST 而非 GET
- 需要不同的请求头
- 需要在请求体中包含额外参数

---

### 原因3：API 文档不完整

你提供的 `MusicAPI.md` 可能：
- 只包含生成接口的文档
- 没有包含查询接口的文档
- 或者是过时的版本

---

## 🛠️ 解决方案

### 方案A：完全依赖回调（需要公网IP）⭐ 推荐

**步骤**：

1. **使用 ngrok 等工具创建公网隧道**：
```bash
# 安装 ngrok
brew install ngrok

# 创建隧道（将本地 8000 端口暴露到公网）
ngrok http 8000

# 会得到类似的URL：
# https://abc123.ngrok.io
```

2. **配置回调 URL**：
```bash
# 在 .env 中添加
SUNO_CALLBACK_URL=https://abc123.ngrok.io/music/callback
```

3. **重启服务器**，Suno 完成后会主动回调。

**优点**：
- ✅ 符合 Suno API 设计
- ✅ 实时性好
- ✅ 不需要轮询

**缺点**：
- ⚠️ 需要 ngrok 或类似工具
- ⚠️ 开发环境配置复杂

---

### 方案B：使用 Suno API 的正确查询接口（需要文档）

**步骤**：

1. **获取完整的 Suno API 文档**：
   - 访问 https://docs.sunoapi.org
   - 或联系 Suno API 支持获取完整文档

2. **找到正确的查询接口**

3. **更新 `suno_client.py` 中的查询路径**

---

### 方案C：降级为轮询数据库（临时方案）✅ 当前可用

**原理**：
- iOS 不直接查询 Suno API
- 通过后端数据库查询任务状态
- 后台任务持续轮询 Suno（通过回调更新）

**修改方案**：

修改 `/music/query/{task_id}` 接口：
```python
@router.get("/query/{task_id}")
async def query_music_task(task_id: str, db: Session = Depends(get_db)):
    # 只查询数据库，不查询 Suno API
    music_task = db.query(MusicTask).filter_by(task_id=task_id).first()
    
    if not music_task:
        return error(code=4004, message="任务不存在")
    
    return success(data={
        "taskId": music_task.task_id,
        "status": music_task.status,
        "musicUrl": music_task.music_url,
        "duration": music_task.duration
    })
```

**优点**：
- ✅ 简单，不需要公网IP
- ✅ 立即可用

**缺点**：
- ⚠️ 状态更新不及时（依赖后台轮询或回调）
- ⚠️ 如果回调失败，状态永远不更新

---

### 方案D：手动测试等待回调（验证性方案）

**步骤**：

1. 保持当前代码不变
2. 等待 5-10 分钟
3. 检查数据库任务状态是否更新

```bash
# 持续监控任务状态
watch -n 10 "cd /Users/lijialiang/Projects/Mynote/MynoteBack && python -c \"
from sqlalchemy import create_engine, text
engine = create_engine('sqlite:///./app.db')
result = engine.execute(text('SELECT task_id, status, music_url FROM music_tasks ORDER BY created_at DESC LIMIT 1'))
row = result.fetchone()
print(f'状态: {row[1]}, URL: {row[2]}')
\""
```

如果回调成功，数据库中的状态会自动更新。

---

## 🎯 当前建议

**立即可行的方案**（按优先级）：

### 1. 采用方案C（降级方案）- 立即可用

修改查询接口，只查数据库不查Suno：

```python
# routers/music.py 中修改 query_music_task
# 注释掉查询 Suno API 的部分
# 只返回数据库中的状态
```

**优点**：立即可用，不阻塞开发

---

### 2. 联系 Suno API 获取完整文档

**问题清单**：
1. 查询任务状态的正确接口是什么？
2. 是否必须使用回调，没有查询接口？
3. 回调的完整格式是什么？

---

### 3. 使用 ngrok 测试完整回调流程

如果想验证完整流程：
```bash
# 1. 安装 ngrok
brew install ngrok

# 2. 启动隧道
ngrok http 8000

# 3. 配置 .env
SUNO_CALLBACK_URL=https://your-ngrok-url.ngrok.io/music/callback

# 4. 重启服务器并测试
```

---

## 📊 测试日志

### 成功创建的任务

**Task ID 1**: `7d488ace62b802353393c0ada76e0861`
- 状态：queued
- 日期：2025-10-16
- 生成参数：Joy 情绪，古典钢琴风格

**Task ID 2**: `8e696bed163af05447c08a2a5ffeee4f`
- 状态：queued  
- 测试时间：2025-10-16
- 生成参数：单一 Joy 情绪测试

**数据库状态**：✅ 任务已正确保存

---

## ⏭️ 下一步行动

### 短期（今天）

**选项1**：采用降级方案继续开发
- 修改查询接口（只查数据库）
- 继续 iOS 开发和测试
- Suno API 调试作为后续优化项

**选项2**：搜索完整 Suno API 文档
- 查找官方文档或示例代码
- 找到正确的查询接口
- 更新客户端代码

**选项3**：使用 ngrok 测试回调
- 安装 ngrok
- 配置公网回调 URL
- 验证完整流程

### 长期（本周）

1. 确定 Suno API 的正确使用方式
2. 优化查询和回调机制
3. 添加更详细的错误处理
4. 编写完整的测试用例

---

## 📝 附录：当前可用的功能

即使查询接口有问题，以下功能仍然可用：

- ✅ 音乐生成接口（已验证）
- ✅ 后端路由和数据库（已验证）
- ✅ 情绪映射服务（已验证）
- ✅ iOS 客户端代码（已完成）
- ✅ 进度UI（已完成）

**可以继续的开发**：
- ✅ 删除旧代码
- ✅ 开始阶段3（HealthKit）
- ✅ iOS 端测试（模拟生成流程）

