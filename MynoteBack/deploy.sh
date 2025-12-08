#!/bin/bash
# Mynote Backend 一键部署脚本
# 适用于 Alibaba Cloud Linux 3

set -e  # 遇到错误立即退出

echo "=========================================="
echo "Mynote Backend 部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目配置
PROJECT_DIR="/opt/MynoteBack"
VENV_DIR="$PROJECT_DIR/venv"
SERVICE_NAME="mynote-backend"

echo ""
echo -e "${GREEN}1. 检查并安装 Python 3.9+${NC}"
if ! command -v python3.9 &> /dev/null; then
    echo "Python 3.9 未安装，开始安装..."
    yum install -y python39 python39-devel python39-pip
else
    echo "Python 3.9 已安装"
fi

python3.9 --version

echo ""
echo -e "${GREEN}2. 安装系统依赖${NC}"
yum install -y gcc make openssl-devel bzip2-devel libffi-devel zlib-devel

echo ""
echo -e "${GREEN}3. 创建 Python 虚拟环境${NC}"
if [ -d "$VENV_DIR" ]; then
    echo "虚拟环境已存在，删除旧环境..."
    rm -rf "$VENV_DIR"
fi

python3.9 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"

echo ""
echo -e "${GREEN}4. 升级 pip${NC}"
pip install --upgrade pip

echo ""
echo -e "${GREEN}5. 安装 Python 依赖${NC}"
cd "$PROJECT_DIR"
pip install -r requirements.txt

echo ""
echo -e "${GREEN}6. 检查环境变量配置${NC}"
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}错误: .env 文件不存在！${NC}"
    echo "请创建 .env 文件并配置以下变量："
    echo "  - SUNO_API_KEY"
    echo "  - DEEPSEEK_API_KEY (如果使用)"
    exit 1
fi

echo ".env 文件存在"
cat "$PROJECT_DIR/.env" | grep -v "API_KEY" || true

echo ""
echo -e "${GREEN}7. 初始化数据库${NC}"
if [ ! -f "$PROJECT_DIR/app.db" ]; then
    echo "创建新数据库..."
    python -c "from config import Base, engine; Base.metadata.create_all(bind=engine)"
    echo "数据库创建成功"
else
    echo "数据库已存在"
fi

echo ""
echo -e "${GREEN}8. 配置防火墙${NC}"
if command -v firewall-cmd &> /dev/null; then
    echo "开放 8000 端口..."
    firewall-cmd --permanent --add-port=8000/tcp || true
    firewall-cmd --reload || true
else
    echo "firewalld 未安装，跳过"
fi

echo ""
echo -e "${GREEN}9. 创建 systemd 服务${NC}"
cat > /etc/systemd/system/${SERVICE_NAME}.service <<EOF
[Unit]
Description=Mynote Backend API Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$PROJECT_DIR
Environment="PATH=$VENV_DIR/bin"
ExecStart=$VENV_DIR/bin/python main.py
Restart=always
RestartSec=10

# 日志配置
StandardOutput=append:/var/log/${SERVICE_NAME}.log
StandardError=append:/var/log/${SERVICE_NAME}.error.log

[Install]
WantedBy=multi-user.target
EOF

echo "systemd 服务文件已创建"

echo ""
echo -e "${GREEN}10. 启动服务${NC}"
systemctl daemon-reload
systemctl enable ${SERVICE_NAME}
systemctl restart ${SERVICE_NAME}

echo ""
echo -e "${GREEN}11. 检查服务状态${NC}"
sleep 3
systemctl status ${SERVICE_NAME} --no-pager || true

echo ""
echo "=========================================="
echo -e "${GREEN}部署完成！${NC}"
echo "=========================================="
echo ""
echo "服务管理命令："
echo "  启动: systemctl start ${SERVICE_NAME}"
echo "  停止: systemctl stop ${SERVICE_NAME}"
echo "  重启: systemctl restart ${SERVICE_NAME}"
echo "  状态: systemctl status ${SERVICE_NAME}"
echo "  日志: journalctl -u ${SERVICE_NAME} -f"
echo ""
echo "API 地址: http://120.76.202.189:8000"
echo "健康检查: curl http://localhost:8000/ping"
echo ""
