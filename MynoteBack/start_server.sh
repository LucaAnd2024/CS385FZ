#!/bin/bash

# Mynote 后端启动脚本

echo "================================"
echo "  Mynote Backend 启动脚本"
echo "================================"
echo ""

# 检查是否在正确的目录
if [ ! -f "main.py" ]; then
    echo "❌ 错误：请在 MynoteBack 目录下运行此脚本"
    exit 1
fi

# 检查 Python 环境
echo "📍 检查 Python 环境..."
python --version

# 检查依赖
echo ""
echo "📦 检查依赖包..."
python -c "
try:
    import fastapi
    import uvicorn
    import sqlalchemy
    import httpx
    print('✅ 所有依赖已安装')
except ImportError as e:
    print(f'❌ 缺少依赖: {e}')
    print('请运行: pip install -r requirements.txt')
    exit(1)
"

if [ $? -ne 0 ]; then
    exit 1
fi

# 检查配置
echo ""
echo "⚙️  检查配置..."
if [ ! -f ".env" ]; then
    echo "⚠️  警告：.env 文件不存在"
    echo "   某些功能可能无法使用（如 Suno API）"
    echo "   请参考 CONFIG.md 创建 .env 文件"
else
    echo "✅ .env 配置文件存在"
fi

# 检查数据库
echo ""
echo "🗄️  检查数据库..."
if [ ! -f "app.db" ]; then
    echo "⚠️  数据库文件不存在，将自动创建"
else
    echo "✅ 数据库文件存在"
fi

# 启动服务器
echo ""
echo "================================"
echo "🚀 启动服务器..."
echo "================================"
echo ""
echo "服务地址："
echo "  - 本地: http://localhost:8000"
echo "  - 局域网: http://$(ipconfig getifaddr en0):8000"
echo ""
echo "API 文档："
echo "  - Swagger UI: http://localhost:8000/docs"
echo "  - ReDoc: http://localhost:8000/redoc"
echo ""
echo "按 CTRL+C 停止服务器"
echo ""

# 启动 uvicorn
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

