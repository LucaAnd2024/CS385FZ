#!/bin/bash
# 服务器环境检查脚本

echo "=========================================="
echo "服务器环境检查"
echo "=========================================="

echo ""
echo "1. 操作系统信息:"
cat /etc/os-release | grep -E "NAME|VERSION"

echo ""
echo "2. Python 版本:"
python3 --version 2>/dev/null || echo "Python3 未安装"

echo ""
echo "3. 内存情况:"
free -h

echo ""
echo "4. 磁盘空间:"
df -h | grep -E "Filesystem|/$"

echo ""
echo "5. 公网 IP:"
curl -s ifconfig.me

echo ""
echo "6. 开放端口:"
ss -tulnp | grep -E "8000|80|443" || echo "关键端口未开放"

echo ""
echo "7. 防火墙状态:"
systemctl status firewalld 2>/dev/null | grep Active || echo "防火墙未启用或不是 firewalld"

echo ""
echo "=========================================="
echo "检查完成"
echo "=========================================="
