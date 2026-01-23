# Studio 模块迁移计划

## 1. 核心流程概述

Studio 模块的核心是将用户的**每日经历**转化为**情绪音乐**。整个流程分为“视觉”和“听觉”两条并行但关联的线路。

### 1.1 交互流程
1.  **用户输入**：用户通过文字或语音输入当天发生的事情（例如：“今天去公园散步，感觉很放松”）。
2.  **AI 分析**：
    *   App 将输入发送给 AI 服务。
    *   AI 分析出核心情绪（例如：`Joy`, `Relaxed`）和关键词。
    *   AI 生成一段简短的回复引导用户继续对话。
3.  **视觉反馈（五线谱）**：
    *   App **本地**根据 AI 分析出的情绪，调用 `StaffScoreToolkit` 算法。
    *   算法选择对应情绪的音符图片（如 `Staff_Joy_1`），并计算其在五线谱上的位置。
    *   界面即时渲染出一段新的五线谱，作为用户情绪的“视觉化”表达。
4.  **最终产出（音乐）**：
    *   当用户结束对话时，App 将整段对话的情绪摘要发送给 **Suno API**。
    *   Suno 生成一段完整的音乐（MP3）。
    *   **关键点**：生成的音乐是基于**情绪 Prompt**，而不是严格演奏界面上的五线谱音符。五线谱是情绪的视觉隐喻，音乐是情绪的听觉表达，两者在“情绪”层面统一。

## 2. 详细设计与实现

### 2.1 底部状态栏 (Bottom Bar)
底部栏是交互的核心，包含 4 种状态，需要精确复刻 iOS 的交互逻辑。

*   **状态 1: Text Guide (文字引导)**
    *   **UI**: 一个长胶囊背景，显示“与 AI 指挥家 DoDo 聊天吧”。
    *   **交互**: 点击任意位置 -> 进入 **State 2**。

*   **状态 2: Text Input (文字输入)**
    *   **UI**: [左: 麦克风图标] + [中: 输入框] + [右: 结束按钮]。
    *   **交互**:
        *   点击左侧麦克风 -> 进入 **State 3**。
        *   点击右侧结束 -> 触发音乐生成流程。
        *   输入文字并发送 -> 触发 AI 分析 -> 渲染五线谱 -> 保持在 State 2。

*   **状态 3: Voice Off (语音待机)**
    *   **UI**: [左: 键盘图标] + [中: 大麦克风] + [右: 结束按钮]。
    *   **交互**:
        *   点击左侧键盘 -> 返回 **State 2**。
        *   **按住**中间麦克风 -> 进入 **State 4** (开始录音)。

*   **状态 4: Voice On (语音录制)**
    *   **UI**: [左: 键盘图标] + [中: 波形动画] + [右: 取消图标]。
    *   **交互**:
        *   **松开手** -> 结束录音，发送语音 -> 触发 AI 分析 -> 返回 **State 3**。
        *   **手指滑动**到右侧取消区 -> 取消录音 -> 返回 **State 3**。

### 2.2 五线谱生成 (Staff Generation)
iOS 端通过**图片堆叠**实现，RN 端将采用相同策略以保证视觉一致性。

*   **资源准备**：需要从 iOS 项目迁移所有 `Staff_*.svg` 或 `.png` 资源（如 `Staff_Joy_1`, `Staff_Sadness_2` 等）。
*   **算法移植 (`StaffScoreToolkit.ts`)**：
    *   输入：情绪类别（如 `Joy`）。
    *   逻辑：
        *   随机选择变体（Variant 1 或 2）。
        *   计算 X 轴位置（固定百分比：30%, 50%, 70%, 90%）。
        *   计算 Y 轴位置（基准线 + 随机抖动 `jitter`）。
    *   输出：一个包含音符位置、图片名称、大小的 JSON 对象数组。
*   **渲染组件 (`StaffView`)**：
    *   背景：使用 `StudioStaff.png` 图片。
    *   音符：根据算法输出的坐标，绝对定位渲染对应的音符图片。

### 2.3 音乐生成 (Music Generation)
*   **API**: 复用 `musicApi.generateDaily`。
*   **参数**: 传入当天积累的所有情绪列表和摘要。
*   **播放**: 获取到 URL 后，使用 `react-native-track-player` 或 `expo-av` 进行播放。

## 3. 开发阶段规划

### 阶段一：基础建设与资源迁移 (Infrastructure & Assets)
**目标**：搭建 Studio 模块的基础框架，确保所有静态资源就位，并移植核心算法。

1.  **代码改动**：
    *   复制 iOS 项目中的 `Staff_*.png/svg`, `chat_*.png`, `StudioStaff.png`, `DoDo.png` 到 `src/assets/images/`。
    *   创建 `src/utils/StaffScoreToolkit.ts`，移植 iOS 的 `StaffScoreToolkit.swift` 逻辑。
    *   创建 `src/screens/StudioScreen.tsx` 的基础结构。
2.  **功能与目的**：
    *   **目的**：为后续 UI 开发提供必要的素材和数据生成工具。
    *   **验证**：运行 `StudioScreen`，确保能加载背景图；编写单元测试或简单的 console log 验证 `StaffScoreToolkit.generateStaffForEvent` 能输出正确的 JSON 数据。
3.  **原因**：没有素材无法开发 UI，没有算法无法生成数据，这是地基。
4.  **规范**：工具类放在 `utils`，图片放在 `assets`，符合项目结构。

### 阶段二：五线谱视觉渲染 (Visual Core)
**目标**：实现静态的五线谱渲染，验证“摆放图片”的方案。

1.  **代码改动**：
    *   创建 `src/components/Studio/StaffView.tsx`。
    *   在 `StudioScreen` 中引入 `StaffView`。
    *   使用 Mock 数据（如 5 个 Joy 音符）传递给 `StaffView` 进行渲染。
2.  **功能与目的**：
    *   **功能**：根据传入的 JSON 数据，在五线谱背景上正确位置显示音符图片。
    *   **验证**：在屏幕上看到五线谱背景，上面有随机分布的音符，且位置合理（不超出边界，符合五线谱视觉）。
3.  **原因**：这是 Studio 最核心的视觉反馈，需要优先保证效果与 iOS 一致。
4.  **规范**：UI 组件拆分到 `components/Studio`，保持 Screen 简洁。

### 阶段三：底部交互与状态管理 (Interaction Core)
**目标**：实现复杂的底部栏交互（4种状态切换、手势）。

1.  **代码改动**：
    *   创建 `src/components/Studio/StudioBottomBar.tsx`。
    *   创建 `src/hooks/useStudioInputMode.ts` 管理 4 种状态。
    *   引入 `react-native-gesture-handler` 实现按住录音和滑动取消。
2.  **功能与目的**：
    *   **功能**：点击不同按钮能切换 UI 状态；按住麦克风能触发录音状态，松开能触发发送回调。
    *   **验证**：手动点击测试所有按钮，确保状态流转正确（如：TextGuide -> TextInput -> VoiceOff -> VoiceOn -> VoiceOff）。
3.  **原因**：这是用户输入的主要入口，交互逻辑复杂，需要独立开发和测试。
4.  **规范**：逻辑抽离到 Hook，组件只负责渲染和事件透传。

### 阶段四：业务逻辑整合 (Integration)
**目标**：串联 AI 对话、五线谱动态生成和最终音乐生成。

1.  **代码改动**：
    *   创建 `src/hooks/useStudioChat.ts` 处理 AI 交互逻辑。
    *   在 `StudioScreen` 中整合 `StudioBottomBar` 和 `StaffView`。
    *   集成 `musicApi` 调用 Suno 生成音乐。
2.  **功能与目的**：
    *   **功能**：用户输入 -> AI 回复 -> 界面新增一段五线谱 -> 点击结束 -> 生成并播放音乐。
    *   **验证**：进行完整的用户旅程测试（User Journey Test），确保从输入到听到音乐的每一步都流畅无 bug。
3.  **原因**：将分散的模块组装成完整的产品功能。
4.  **规范**：Screen 作为容器组件，协调各个子组件和 Hooks。

### 阶段五：重构 UI 流程 (UI Flow Refactor)
**目标**：严格复刻 iOS 的 UI 流程，包括静态入口页、全屏交互页和弹窗层级。

1.  **代码改动**：
    *   **重构 `StudioScreen.tsx`**：
        *   引入 `StudioView` (静态入口) 和 `StudioIntroView` (全屏交互) 两个状态。
        *   使用 `Modal` 或条件渲染来实现 `StudioIntroView` 的全屏覆盖。
    *   **完善 `StudioIntroView`**：
        *   实现层级结构：背景 -> 顶部栏 -> 五线谱 -> DoDo -> 底部栏 -> 弹窗层 (`AIPopup`, `AIResponse`, `VoicePopup`)。
    *   **实现乐器选择弹窗**：Mock 一个简单的 `StudioInstrumentSelectView`。
    *   **更新 `useStudioChat.ts`**：增加控制弹窗显隐的状态逻辑。

2.  **功能与目的**：
    *   **功能**：
        *   默认显示静态入口页。
        *   点击后全屏弹出交互页，并自动弹出乐器选择。
        *   对话过程中正确显示/隐藏 AI 气泡和回复卡片。
    *   **验证**：
        *   点击入口 -> 看到乐器选择 -> 确认后看到 AI 提问。
        *   发送消息 -> 气泡消失 -> 五线谱增加 -> 回复卡片出现。
3.  **原因**：之前的实现忽略了入口页和弹窗层级，需要对齐 iOS 的原生体验。
4.  **规范**：保持组件拆分，使用 RN 的 `Modal` 或绝对定位实现层级覆盖。

### 阶段六：集成 Demo 模式 (Demo Mode Integration)
**目标**：引入“假数据”模式，以便在演示时能稳定复现特定的对话场景和情绪分析结果，避免依赖不稳定的真实 AI。

1.  **代码改动**：
    *   **创建 `src/utils/DemoConversationData.ts`**：移植 Swift 中的 `DemoConversationData` 结构和预设数据（4个场景）。
    *   **更新 `src/hooks/useStudioChat.ts`**：
        *   增加 `IS_DEMO_MODE` 开关。
        *   实现 `matchAnswer` 逻辑：根据用户输入关键词匹配预设回复。
        *   实现剧情推进逻辑：根据 `questionIndex` 依次展示预设问题。

2.  **功能与目的**：
    *   **功能**：在 Demo 模式下，用户输入特定关键词（如“比赛”、“团队”）能触发固定的情绪分析和回复。
    *   **验证**：
        *   输入“比赛” -> 触发“睡眠不足”场景的回复 -> 生成 Fear/Sadness 五线谱。
        *   输入“团队” -> 触发“上午心率”场景的回复 -> 生成 Joy/Digest 五线谱。
3.  **原因**：演示需要确定性，且真实 AI 接口可能耗时或不稳定。
4.  **规范**：Demo 数据与业务逻辑分离，通过开关控制，不影响真实逻辑。

## 4. 疑问与确认
*   **确认**：五线谱仅作为视觉反馈，不参与最终音乐生成的音频合成（即不需要在 RN 端实现 MIDI 转音频）。
*   **确认**：图片资源将直接使用 iOS 的导出版本（SVG 或高倍图 PNG）。
