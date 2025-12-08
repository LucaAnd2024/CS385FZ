# 后端配置说明

## 环境变量配置

### 必需配置

#### SUNO_API_KEY
- **说明**：Suno API 密钥
- **获取方式**：访问 https://sunoapi.org/api-key 获取
- **示例**：`SUNO_API_KEY=sk-xxxxxxxxxxxxx`

### 可选配置

#### DATABASE_URL
- **说明**：数据库连接 URL
- **默认值**：`sqlite:///./app.db`（SQLite 本地数据库）
- **PostgreSQL 示例**：`postgresql://user:password@localhost:5432/mynote`

#### SUNO_CALLBACK_URL
- **说明**：Suno 任务完成回调 URL
- **作用**：配置后，Suno 会在任务完成时主动通知，无需轮询
- **示例**：`http://your-server.com:8000/music/callback`
- **注意**：需要确保 URL 可被 Suno 服务器访问（需要公网 IP 或域名）

#### CORS_ORIGINS
- **说明**：允许的跨域源
- **默认值**：`*`（允许所有源）
- **生产环境**：`http://localhost:3000,https://your-frontend.com`

## 配置步骤

1. 创建 `.env` 文件：
```bash
cd MynoteBack
touch .env
```

2. 添加必需配置：
```bash
SUNO_API_KEY=your-api-key-here
```

3. （可选）配置其他选项

## 验证配置

启动服务后访问：
- http://localhost:8000/docs - 查看 API 文档
- http://localhost:8000/music/health - 检查 Suno API 连接状态

## 常见问题

### Q: SUNO_API_KEY 未配置
**错误**：`Suno API 未配置`
**解决**：确保 `.env` 文件中有 `SUNO_API_KEY=xxx`

### Q: 数据库表不存在
**解决**：重启服务，FastAPI 会自动创建表

### Q: Suno 回调不工作
**原因**：本地开发环境 Suno 无法访问
**解决**：
1. 开发环境：不配置 `SUNO_CALLBACK_URL`，使用轮询
2. 生产环境：配置公网可访问的回调 URL

