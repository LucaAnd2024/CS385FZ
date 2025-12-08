# MyNote 音乐生成服务

## 📋 简介

为MyNote iOS应用提供EMelodyGen音乐生成服务的Python后端。

**架构：**
```
iOS App → HTTP → Python Flask服务 → HTTP → EMelodyGen Gradio API → 音乐MP3
```

## 🚀 快速开始

### 1. 安装依赖

```bash
cd /Users/lijialiang/Projects/Mynote/MynoteBack
.venv/bin/pip install -r requirements.txt
```

### 2. 启动服务

```bash
.venv/bin/python music_service.py
```

**预期输出：**
```
🚀 启动EMelodyGen服务 V2 (Direct HTTP)
📍 http://0.0.0.0:5001
 * Running on http://127.0.0.1:5001
```

### 3. 验证服务

```bash
curl http://localhost:5001/health
```

应该返回：
```json
{"status": "ok", "service": "EMelodyGen Music Service V2"}
```

## 🧪 测试音乐生成

```bash
curl -X POST http://localhost:5001/api/generate_segment \
  -H "Content-Type: application/json" \
  -d '{"emotion":"Joy","v":"High (高)","a":"High (高)","event_text":"测试"}' \
  -o test_music.mp3
```

如果成功，会下载一个15秒的MP3文件。

## 📁 文件说明

```
MynoteBack/
├── music_service.py          # 主服务文件（核心）
├── requirements.txt          # Python依赖
├── README.md                 # 本文档
└── .venv/                    # Python虚拟环境
```

## 🎵 API文档

### POST /api/generate_segment

**请求：**
```json
{
  "emotion": "Joy",           # 情绪类型
  "v": "High (高)",           # Valence愉悦度
  "a": "High (高)",           # Arousal唤醒度
  "event_text": "早晨跑步"    # 事件描述
}
```

**响应：** MP3音频文件（约15秒）

**情绪参数映射：**
- Joy: v="High (高)", a="High (高)"
- Sadness: v="Low (低)", a="Low (低)"
- Anger: v="Low (低)", a="High (高)"
- Fear: v="Low (低)", a="High (高)"
- Surprise: v="High (高)", a="High (高)"
- Digest: v="High (高)", a="Low (低)"

## 🐛 故障排查

### 问题1：端口被占用
```bash
# 杀掉占用5001端口的进程
lsof -ti:5001 | xargs kill -9
```

### 问题2：模块未找到
```bash
# 重新安装依赖
.venv/bin/pip install -r requirements.txt
```

### 问题3：EMelodyGen API超时
- 检查网络连接
- EMelodyGen服务可能暂时不可用，稍后重试

## 📝 日志说明

**正常日志：**
```
🎵 收到音乐生成请求
   情绪: Joy, v=High (高), a=High (高)
📡 调用Gradio API...
✅ 音频下载成功，大小: XXXX 字节
```

**错误日志：**
```
❌ 生成失败: ...
   - 异常类型: ...
   - 异常消息: ...
   - 堆栈跟踪: ...
```

---

**维护者：** AI Assistant for MyNote Project
**最后更新：** 2025-10-08

