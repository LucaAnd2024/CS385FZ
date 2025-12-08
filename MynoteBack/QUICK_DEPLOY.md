# 🚀 快速部署命令清单

## 第1步：创建 GitHub 仓库
1. 访问：https://github.com/new
2. 仓库名：`MynoteBack`
3. 可见性：**Private**
4. 点击 **Create repository**

---

## 第2步：推送代码（复制命令执行）

```bash
# 1. 添加远程仓库（替换为你的 GitHub 用户名）
git remote add origin https://github.com/你的用户名/MynoteBack.git

# 2. 推送代码
git branch -M main
git push -u origin main
```

---

## 第3步：部署到 Railway
1. 访问：https://railway.app
2. 点击 **"Login with GitHub"**
3. 点击 **"New Project"**
4. 选择 **"Deploy from GitHub repo"**
5. 选择 **"MynoteBack"** 仓库
6. 点击 **"Deploy Now"**

⏳ 等待 2-3 分钟自动部署...

---

## 第4步：配置环境变量
在 Railway Dashboard：
1. 点击项目
2. 点击 **"Variables"** 标签
3. 点击 **"+ New Variable"**

添加：
```
SUNO_API_KEY = 9a92ba4f0cd0886f553f3a23c0e1d3f4
```

---

## 第5步：获取生产 URL
在 Railway Dashboard：
1. 点击 **"Settings"** 标签
2. 找到 **"Domains"** 部分
3. 点击 **"Generate Domain"**

复制生成的 URL：
```
https://mynote-back-production-xxxx.up.railway.app
```

---

## 第6步：测试 API
在浏览器访问（替换为你的 URL）：
```
https://你的域名.railway.app/ping
```

应该看到：
```json
{"message": "pong"}
```

✅ 部署成功！

---

## 第7步：更新 iOS 代码

我会帮你创建 APIConfig.swift 文件。

完整指南请查看：`DEPLOYMENT_GUIDE.md`
