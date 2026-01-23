# SongDetailView 迁移计划

## 1. 概述
本文档概述了将 `SongDetailView` 从 iOS (SwiftUI) 迁移到 React Native 的计划。目标是提供一个音乐创作的详细视图，充当“音乐日记本”的角色，让用户可以聆听生成的歌曲并查看各个情绪片段。

该视图的数据将基于现有的 `DemoConversationData` 模式进行 Mock（模拟），因为目前没有针对此特定视图的真实后端数据。

## 2. Mock 数据策略
- **来源**：扩展 `DemoConversationData.ts` 中的概念。
- **结构**：创建一个新的 `MockCreationData.ts` 或扩展 `DemoConversationData` 以包含完整的 `MyNoteCreation` 对象。
- **内容**：
    - **创作元数据**：标题、日期（例如："2023.10.24"）、作曲者 ("Joy")、编曲者 ("AI Partner")。
    - **音乐片段**：对应 Studio 会话中聊天消息/情绪的片段列表。每个片段需要：
        - `id`：唯一标识符。
        - `timeWindow`：开始和结束时间（例如：10:00 AM - 10:30 AM）。
        - `eventText`：日记文本/内容（例如："今天天气真好..."）。
        - `emotions`：用于生成五线谱音符的情绪列表（例如：`Joy`（快乐）, `Surprise`（惊讶））。
        - `audioDuration`：时长秒数（用于播放模拟）。
    - **五线谱 (Staff Scores)**：从片段衍生的预计算 `StaffScore` 对象（使用 `StaffScoreToolkit`）。

## 3. 核心组件

### 3.1 数据模型 (`src/types/MyNoteCreation.ts`)
定义 TypeScript 接口以匹配 iOS 的 `MyNoteCreation` 结构体。
- `MyNoteCreation`
- `MusicSegmentInfo`
- `TimeWindow`

### 3.2 主屏幕 (`src/screens/SongDetailScreen.tsx`)
- **布局**：`VStack` 结构。
- **背景**：`SongDetailViewBack`。
- **动画**：
    - 旋转唱片（复用 `StudioFinishedView` 中的逻辑）。
    - 唱针臂（摆入/摆出）。

### 3.3 UI 区域
1.  **头部**：返回导航按钮。
2.  **唱片机**：
    - 视觉效果：旋转碟片、唱针、静态封面信息。
    - 覆盖层：歌曲标题、日期。
3.  **播放控制**：
    - 播放/暂停切换。
    - 用于调整进度的滑块 (Slider)。
    - 更新进度的计时器逻辑。
4.  **五线谱列表（“音乐日记”）**：
    - `StaffView` 组件的 ScrollView。
    - **交互**：点击一行 -> 跳转到该片段 -> 显示弹窗。
5.  **弹窗系统 (`SegmentEventPopup`)**：
    - **挑战**：在此行附近定位弹窗。
    - **解决方案**：从列表的 `onPress` 事件中跟踪 `tapLocation`（Y 坐标），并在列表上方渲染绝对定位的 View。
6.  **操作按钮**：
    - “手机播放”（目前仅视觉效果）。
    - “VP 模式”（目前仅视觉效果）。

## 4. 实现步骤

### 步骤 1：文档与数据
- [x] 创建此 Plan.md。
- [ ] 创建 `src/types/MyNoteCreation.ts`。
- [ ] 创建 `src/utils/MockCreationData.ts`（扩展 `DemoConversationData`）。

### 步骤 2：屏幕骨架
- [ ] 创建 `src/screens/SongDetailScreen.tsx`。
- [ ] 实现基本布局和导航注册 (`RootNavigator`)。

### 步骤 3：唱片机与控制
- [ ] 从 `StudioFinishedView` 移植动画逻辑。
- [ ] 实现播放/暂停状态和专用于进度的计时器。
- [ ] 添加滑块 (Slider) 控件。

### 步骤 4：五线谱列表与弹窗逻辑
- [ ] 使用 `MockData` 渲染片段列表。
- [ ] 实现点击跳转逻辑。
- [ ] 实现基于坐标的弹窗系统。

### 步骤 5：最终润色
- [ ] 对照 iOS 截图/代码验证样式。
- [ ] 确保动画流畅。

## 5. 潜在问题/风险
- **资源**：确保 iOS 中引用的所有图片（`SongDetailViewBack`, `vp_musicBox_fore`, `HomeSongDetailPhoneMusic` 等）都在 `src/assets` 中可用。
- **导航**：如何进入此屏幕？（将从 `HomeScreen` 或 `StudioScreen` 添加临时入口点）。
