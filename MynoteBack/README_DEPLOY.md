# Mynote Backend 部署指南

## 服务器信息

- **IP**: 120.76.202.189
- **OS**: Alibaba Cloud Linux 3
- **Python**: 3.9+
- **部署目录**: /opt/MynoteBack

## 快速部署

### 1. 上传项目到服务器

在你的 Mac 上运行：

```bash
# 确保在项目根目录
cd /Users/lijialiang/Projects/Mynote

# 上传整个后端项目
scp -r MynoteBack root@120.76.202.189:/opt/
```

### 2. 配置环境变量

SSH 连接到服务器：

```bash
ssh root@120.76.202.189
```

编辑 .env 文件：

```bash
cd /opt/MynoteBack
cp .env.example .env
nano .env  # 或使用 vi
```

填写你的 API Keys：
```
SUNO_API_KEY=你的_Suno_API_Key
DEEPSEEK_API_KEY=你的_DeepSeek_API_Key
```

保存并退出（nano: Ctrl+X, Y, Enter）

### 3. 执行部署脚本

```bash
cd /opt/MynoteBack
chmod +x deploy.sh
bash deploy.sh
```

部署脚本会自动：
- ✅ 安装 Python 3.9
- ✅ 创建虚拟环境
- ✅ 安装依赖
- ✅ 初始化数据库
- ✅ 配置 systemd 服务
- ✅ 启动服务

### 4. 验证部署

```bash
# 检查服务状态
systemctl status mynote-backend

# 测试 API
curl http://localhost:8000/
curl http://localhost:8000/ping

# 从外网测试
curl http://120.76.202.189:8000/
```

## 服务管理

```bash
# 启动服务
systemctl start mynote-backend

# 停止服务
systemctl stop mynote-backend

# 重启服务
systemctl restart mynote-backend

# 查看状态
systemctl status mynote-backend

# 查看日志
journalctl -u mynote-backend -f

# 查看最近 100 行日志
journalctl -u mynote-backend -n 100
```

## 日志位置

- **标准输出**: /var/log/mynote-backend.log
- **错误日志**: /var/log/mynote-backend.error.log
- **systemd 日志**: journalctl -u mynote-backend

## 更新代码

```bash
# 在 Mac 上重新上传
scp -r MynoteBack root@120.76.202.189:/opt/

# 在服务器上重启服务
ssh root@120.76.202.189
systemctl restart mynote-backend
```

## 常见问题

### 1. 服务启动失败

```bash
# 查看详细日志
journalctl -u mynote-backend -n 50

# 检查端口占用
ss -tulnp | grep :8000

# 手动启动测试
cd /opt/MynoteBack
source venv/bin/activate
python main.py
```

### 2. API 无法访问

- 检查阿里云安全组是否开放 8000 端口
- 检查防火墙：`firewall-cmd --list-ports`
- 检查服务状态：`systemctl status mynote-backend`

### 3. 数据库问题

```bash
# 重新初始化数据库
cd /opt/MynoteBack
rm app.db
source venv/bin/activate
python -c "from config import Base, engine; Base.metadata.create_all(bind=engine)"
```

## API 端点

- **根路径**: http://120.76.202.189:8000/
- **健康检查**: http://120.76.202.189:8000/ping
- **API 文档**: http://120.76.202.189:8000/docs
- **用户管理**: http://120.76.202.189:8000/users
- **情绪记录**: http://120.76.202.189:8000/emotions
- **音乐生成**: http://120.76.202.189:8000/music

## 安全建议

1. **配置 Nginx 反向代理**（推荐）
2. **启用 HTTPS**（使用 Let's Encrypt）
3. **限制 SSH 访问**（只允许特定 IP）
4. **定期备份数据库**
5. **监控服务器资源**

## 下一步优化

- [ ] 配置 Nginx 反向代理
- [ ] 配置域名和 HTTPS
- [ ] 迁移到 PostgreSQL
- [ ] 配置自动备份
- [ ] 配置监控告警

---

**维护者**: Mynote Team  
**最后更新**: 2025-10-25
