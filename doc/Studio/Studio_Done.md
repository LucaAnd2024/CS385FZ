# Studio 模块迁移与实现总结报告

## 1. 模块概述 (Module Overview)
**Studio (音乐工坊)** 是 Mynote 应用的核心模块，旨在通过 AI 对话引导用户表达当下的情绪与经历，并将这些情绪转化为可视化的五线谱 (Staff) 和最终的音乐旋律。

本次迁移将原本 iOS (SwiftUI) 的复杂交互逻辑完整复刻到了 React Native 中，重点实现了**情绪驱动的五线谱生成**、**多模态输入交互**以及**基于剧本的 Demo 演示模式**。

---

## 2. 核心功能 (Core Features)

### 2.1 情绪可视化 (Emotion Visualization)
*   **五线谱生成**：根据 AI 分析出的情绪（如 Joy, Sadness, Anger 等），动态生成对应的音符布局。
*   **累积显示**：随着对话的进行，新的五线谱片段会依次追加到屏幕上，形成一条完整的情绪记录长卷。
*   **SVG 渲染**：使用 SVG 资源精确还原 iOS 端的设计细节，包括音符的跳动位置、大小和阴影效果。

### 2.2 AI 智能对话流 (AI Conversation Flow)
*   **交互闭环**：AI 提问 -> 用户输入 -> AI 分析（生成五线谱 + 回复）-> 自动倒计时/点击继续 -> 下一轮提问。
*   **状态管理**：精确控制提问气泡 (`AIPopupView`) 和回复卡片 (`AIResponseCardView`) 的显示时机，确保交互流畅不冲突。
*   **自动推进**：实现了类似 iOS `DeepseekAPIClient` 的决策逻辑，AI 回复展示 3 秒后自动进入下一环节，无需用户频繁操作。

### 2.3 多模态输入 (Multimodal Input)
底部状态栏 (`StudioBottomBar`) 实现了四种状态的平滑切换：
1.  **Text Guide**: 引导状态，提示用户开始对话。
2.  **Text Input**: 文本输入框，支持键盘交互。
3.  **Voice Off**: 语音待机状态，显示麦克风图标。
4.  **Voice On**: 语音录制状态，显示波纹动画（模拟）和录音提示。

### 2.4 Demo 演示模式 (Demo Mode)
为了保证演示效果的稳定性，内置了完整的剧本系统：
*   **场景化剧本**：包含“睡眠不足”、“上午心率”、“下午工作”、“晚上娱乐”四个标准时间段场景。
*   **关键词触发**：输入特定关键词（如“比赛”、“团队”、“恐怖电影”）即可触发预设的高质量回复和特定的五线谱生成。

---

## 3. UI 架构与组件细节 (UI Architecture)

整个模块采用 **ZStack (绝对定位)** 布局策略，以还原 iOS 的层级覆盖效果。

### 3.1 页面结构 (`StudioScreen.tsx`)
*   **入口页 (`StudioView`)**：静态展示页，点击任意位置进入沉浸式对话。
*   **主容器 (Modal)**：全屏模态窗口，承载所有交互内容。
*   **背景层**：根据状态切换背景图 (`StudioViewBack.png` / `StudioViewBackGround.png`)。

### 3.2 关键组件
| 组件名 | 对应文件 | 功能描述 |
| :--- | :--- | :--- |
| **StudioInstrumentSelectView** | `StudioInstrumentSelectView.tsx` | 乐器选择弹窗（Piano/Guitar/Bass），含“敬请期待”逻辑。 |
| **AIPopupView** | `AIPopupView.tsx` | 顶部悬浮气泡，展示 AI 根据健康数据生成的提问。 |
| **AIResponseCardView** | `AIResponseCardView.tsx` | 屏幕中央卡片，展示 AI 的共情回复，支持点击跳过倒计时。 |
| **StaffView** | `StaffView.tsx` | 五线谱渲染组件，接收 `StaffNote` 数组并布局 SVG 音符。 |
| **StudioBottomBar** | `StudioBottomBar.tsx` | 底部交互栏，处理点击、长按、拖拽取消等手势逻辑。 |

### 3.3 布局策略
*   **五线谱区域**：使用固定高度的 `ScrollView`，始终展示约两行五线谱的高度，内容过多时可滑动查看历史，避免挤占 UI 空间。
*   **DoDo 形象**：固定在五线谱区域下方，作为陪伴形象。

---

## 4. 代码实现细节 (Technical Implementation)

### 4.1 核心逻辑 Hook (`useStudioChat.ts`)
这是整个对话流程的大脑，管理以下状态：
*   **UI 显隐**：`showAIChat`, `showAIResponse`, `isProcessing`。
*   **数据流**：`aiQuestion`, `aiResponseText`, `lastEmotions`。
*   **流程控制**：
    *   `processUserInput`: 模拟 AI 思考延迟，调用 Demo 数据匹配逻辑。
    *   `nextRound`: 根据 `conversationAction` 决定是继续追问还是结束对话。
    *   **自动倒计时**：使用 `useEffect` 监听回复卡片状态，实现 3 秒自动跳转。

### 4.2 五线谱算法 (`StaffScoreToolkit.ts`)
完整移植了 iOS 的 Swift 算法：
*   **`generateStaffForEvent`**：根据情绪类别（如 Joy, Sadness）和强度，计算音符在五线谱上的分布。
*   **`jitter`**：引入随机抖动，让音符排列更具艺术感和自然感。
*   **布局配置**：定义了 `Upper` 和 `Lower` 区域的坐标系统。

### 4.3 Demo 数据引擎 (`DemoConversationData.ts`)
*   定义了 `ConversationScenario` 接口，包含时间段、预设问题、匹配规则。
*   **`matchAnswer`**：根据用户输入的关键词（如 "stress", "game" 等）模糊匹配预设回答，若无匹配则返回默认兜底回复。

---

## 5. 使用指南 (Usage Guide)

### 5.1 启动流程
1.  进入 App 首页，点击 **Studio** 标签。
2.  点击屏幕任意位置（DoDo 图片）。
3.  在弹出的乐器选择页中，选择 **Piano** 并确认。

### 5.2 演示剧本 (Demo Script)

**场景一：昨晚睡眠不足**
*   **AI 提问**：...昨晚休息得有点短...
*   **输入**：包含 **"比赛"** 或 **"紧张"**。
*   **结果**：生成 `Fear` + `Sadness` 五线谱，AI 回复安抚内容。

**场景二：上午心率平稳**
*   **AI 提问**：...心率变得平稳了...
*   **输入**：包含 **"团队"** 或 **"鼓励"**。
*   **结果**：生成 `Joy` + `Digest` 五线谱，AI 回复关于团队力量的内容。

**场景三：晚上心率升高**
*   **AI 提问**：...心跳又加快了...
*   **输入**：包含 **"恐怖"** 或 **"电影"**。
*   **结果**：生成 `Fear` + `Joy` (刺激) 五线谱，触发对话结束。

### 5.3 结束与生成
*   当对话进入尾声（Demo 剧本走完），系统会自动弹出 `Generating Music` 提示，模拟音乐生成过程。

---

## 6. 文件清单 (File List)

**核心逻辑与工具**
*   `src/screens/StudioScreen.tsx` (主控制器)
*   `src/hooks/useStudioChat.ts` (对话逻辑 Hook)
*   `src/hooks/useStudioInputMode.ts` (输入栏状态 Hook)
*   `src/utils/StaffScoreToolkit.ts` (五线谱算法)
*   `src/utils/DemoConversationData.ts` (Demo 数据)
*   `src/utils/StaffAssets.ts` (SVG 资源映射)

**UI 组件**
*   `src/components/Studio/StudioView.tsx`
*   `src/components/Studio/StudioBottomBar.tsx`
*   `src/components/Studio/StudioInstrumentSelectView.tsx`
*   `src/components/Studio/AIPopupView.tsx`
*   `src/components/Studio/AIResponseCardView.tsx`
*   `src/components/Studio/StaffView.tsx`

**资源文件**
*   `src/assets/images/Staff_*.svg` (大量音符资源)
*   `src/assets/images/Studio*.png` (背景图)
