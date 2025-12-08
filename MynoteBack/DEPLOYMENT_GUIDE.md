# Railway 部署指南 - 详细步骤

**生成时间**：2025-10-21  
**预计时间**：30分钟

---

## ✅ 已完成的准备工作

- [x] 修改 `main.py` 支持动态端口
- [x] 创建 `Procfile` 启动配置
- [x] 创建 `.gitignore` 排除敏感文件
- [x] 提交代码到本地 Git

---

## 📋 接下来的步骤

### 第1步：创建 GitHub 仓库（5分钟）

#### 1.1 访问 GitHub
打开浏览器访问：https://github.com/new

#### 1.2 创建仓库
- **Repository name**：`MynoteBack` 或 `mynote-backend`
- **Description**：MyNote Backend API Server
- **Visibility**：Private（推荐，保护 API Key）
- **不要**勾选 "Initialize this repository with a README"（我们已经有了）

#### 1.3 创建完成
点击 **"Create repository"**，记下仓库 URL：
```
https://github.com/你的用户名/MynoteBack.git
```

---

### 第2步：推送代码到 GitHub（2分钟）

#### 2.1 添加远程仓库
在终端执行（替换为你的仓库 URL）：
```bash
cd /Users/lijialiang/Projects/Mynote/MynoteBack
git remote add origin https://github.com/你的用户名/MynoteBack.git
```

#### 2.2 推送代码
```bash
git branch -M main
git push -u origin main
```

#### 2.3 验证
刷新 GitHub 页面，应该能看到所有文件（除了 .env）

---

### 第3步：部署到 Railway（10分钟）

#### 3.1 注册 Railway
1. 访问 https://railway.app
2. 点击右上角 **"Login"**
3. 选择 **"Login with GitHub"**
4. 授权 Railway 访问你的 GitHub

#### 3.2 创建新项目
1. 登录后，点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 找到并选择 **"MynoteBack"** 仓库
4. 点击 **"Deploy Now"**

#### 3.3 等待自动检测
Railway 会自动：
- ✅ 检测到 Python 项目
- ✅ 读取 `requirements.txt`
- ✅ 读取 `Procfile`
- ✅ 开始构建和部署（2-3分钟）

#### 3.4 观察部署日志
在 Railway Dashboard 中，你会看到：
```
Installing dependencies from requirements.txt...
✓ Successfully installed fastapi uvicorn ...
Starting application...
🚀 Starting Mynote Backend on port 8000...
```

---

### 第4步：配置环境变量（5分钟）⚠️ 重要

#### 4.1 进入设置
在 Railway Dashboard：
1. 点击你的项目
2. 点击 **"Variables"** 标签

#### 4.2 添加环境变量
点击 **"+ New Variable"**，逐个添加：

**必需变量**：
```
SUNO_API_KEY = 9a92ba4f0cd0886f553f3a23c0e1d3f4
```

**可选变量**：
```
DATABASE_URL = sqlite:///./app.db
CORS_ORIGINS = *
```

#### 4.3 保存并重启
添加完成后：
1. Railway 会自动重启服务
2. 等待30秒让服务完全启动

---

### 第5步：获取生产 URL（1分钟）

#### 5.1 生成域名
在 Railway Dashboard：
1. 点击你的项目
2. 点击 **"Settings"** 标签
3. 找到 **"Domains"** 部分
4. 点击 **"Generate Domain"**

#### 5.2 获取 URL
Railway 会生成一个域名，类似：
```
https://mynote-back-production.up.railway.app
```

#### 5.3 测试 API
在浏览器访问（替换为你的域名）：
```
https://your-app.railway.app/ping
```

应该看到：
```json
{"message": "pong"}
```

✅ 如果看到这个响应，说明部署成功！

---

### 第6步：更新 iOS 配置（5分钟）

#### 6.1 创建 APIConfig.swift
在 Xcode 中创建新文件：
```
Mynote-iOS/Mynote-iOS/Config/APIConfig.swift
```

内容：
```swift
//
//  APIConfig.swift
//  Mynote-iOS
//
//  API 配置管理
//

import Foundation

struct APIConfig {
    
    // 后端 API 基础 URL
    #if DEBUG
    // 开发环境：使用本地服务器
    static let baseURL = "http://localhost:8000"
    #else
    // 生产环境：使用 Railway 部署的服务器
    static let baseURL = "https://mynote-back-production.up.railway.app"
    #endif
    
    // Suno API 端点
    static var sunoGenerateURL: String {
        return "\(baseURL)/music/generate"
    }
    
    static var sunoQueryURL: String {
        return "\(baseURL)/music/query"
    }
    
    // AI 对话端点
    static var aiChatURL: String {
        return "\(baseURL)/ai/chat"
    }
}
```

#### 6.2 更新现有代码
找到所有使用 `http://localhost:8000` 的地方，替换为：
```swift
APIConfig.baseURL
// 或
APIConfig.sunoGenerateURL
```

#### 6.3 编译测试
1. 选择 **Release** 模式：Product → Scheme → Edit Scheme → Run → Build Configuration → Release
2. 真机运行
3. 测试音乐生成功能

---

## 🎉 完成验证

### 验证清单
- [ ] Railway 部署成功（绿色状态）
- [ ] 环境变量已配置（SUNO_API_KEY）
- [ ] 生产 URL 可以访问（/ping 返回 pong）
- [ ] iOS 代码已更新（使用 APIConfig）
- [ ] Release 模式真机测试成功
- [ ] 音乐生成功能正常

---

## 🔍 常见问题

### Q1: 部署失败，显示 "Build failed"
**解决方案**：
1. 检查 Railway 日志，找到错误信息
2. 确保 `requirements.txt` 格式正确
3. 确保 Python 版本兼容（Railway 默认使用 Python 3.11）

### Q2: 环境变量没有生效
**解决方案**：
1. 确保变量名拼写正确（区分大小写）
2. 添加变量后需要重启服务
3. 在 Railway 日志中搜索 "SUNO_API_KEY" 确认已加载

### Q3: iOS 无法连接到 Railway
**解决方案**：
1. 确保使用的是 HTTPS URL（不是 HTTP）
2. 检查 CORS 配置是否允许所有来源
3. 在 Safari 浏览器中测试 API 是否可访问

### Q4: 音乐生成失败
**解决方案**：
1. 检查 Suno API Key 是否正确
2. 查看 Railway 日志，搜索 "Suno" 相关错误
3. 确保 Railway 服务没有因为超时而休眠

---

## 💰 费用说明

### Railway 免费额度
- **免费额度**：$5/月
- **预计使用**：
  - 24/7 在线：~$3/月
  - 自动休眠：~$1/月
- **超额付费**：$0.01/小时

### 建议
- 开发阶段：使用免费额度
- 测试阶段：启用自动休眠（Settings → Sleep）
- 生产阶段：升级到付费计划（$5/月起）

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 Railway 部署日志
2. 查看本文档的"常见问题"部分
3. 检查 GitHub Issues

---

## 🎯 下一步

部署完成后，可以继续开发：
1. ✅ **HealthKit 集成** - 真实健康数据驱动
2. **Vision Pro 端** - 恢复开发
3. **性能优化** - 缓存、CDN 等

---

**祝部署顺利！🚀**
