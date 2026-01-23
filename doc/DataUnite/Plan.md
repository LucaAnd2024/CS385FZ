# 数据统一开发文档 / Data Unification Development Plan

本文档旨在详述如何将 React Native 项目中的数据结构（HomeScreen 和 Studio）进行统一，使其符合真实的业务逻辑（参考 iOS 项目的实现），并确保前后端交互的数据一致性。

## 1. 现状分析与问题 / Current Status & Issues

目前项目中存在两套割裂的数据体系：
1.  **HomeScreen**: 使用 `Score` + `HomeCard` 结构，数据来源于 API 或 Mock，主要关注 `id`, `title`, `staves`(简单谱面)。
2.  **Studio**: 使用 `StaffScore[]`，数据来源于用户的实时输入生成的五线谱数组。其缺失了作为一个完整“作品”所需的元数据（如 `title`, `musicSegments` 等）。
3.  **SongDetailScreen**: 需要展示详细的播放信息（`musicSegments`），但首页只有简单信息，目前依赖 `enrichScore` 工具进行简单的“假数据填充”。

**核心问题**: Studio 创作完成后，没有生成包含完整播放信息的 `Score` 对象，导致无法真实地回放用户创作的音乐。真实的逻辑应该是：Studio 中的每一轮对话 -> 生成一段 MusicSegment (包含情感、文本、音频) + 一段五线谱 (Staff)。

## 2. 目标数据结构 / Target Data Structure

我们将参考 iOS 项目 (`MusicSegmentModels.swift`)，重新定义核心的 `Score` (对应 iOS 的 `MyNoteCreation`/`CompleteSong`)。

### 核心类型 (在 `src/services/api.ts` 中定义)

```typescript
// 对应 iOS 的 TimeWindow
export interface TimeWindow {
    startTime: Date;
    endTime: Date;
}

// 对应 iOS 的 MusicSegmentRecord
export interface MusicSegmentInfo {
    id: string;             // UUID
    eventText: string;      // 用户输入的文本或 AI 总结的日记
    emotions: StaffEmotionCategory[]; // 情感分析结果
    audioFilePath: string;  // 对应的音频切片路径
    duration: number;       // 时长 (e.g. 15s)
    order: number;          // 排序
    timeWindow: TimeWindow; // 该对话对应的时间段
    
    // 关联的五线谱 ID (可选，用于反查)
    staffId?: string; 
}

// 对应 iOS 的 MyNoteCreation / CompleteSong
export interface Score {
    id: string;
    title: string;
    createdAt: string;

    // 作者信息
    composerText: string; // e.g., "User"
    arrangerText: string; // e.g., "AI Partner"
    
    // 核心内容
    musicSegments: MusicSegmentInfo[]; // 用于播放和详情页展示列表
    staves: StaffScore[]; // 用于五线谱渲染 (StaffScore 定义在 StaffScoreToolkit)
    
    // UI 辅助
    coverImageName?: string; // e.g., "MoodMapView_Joy"
    dominantEmotion?: string; // "joy"
}
```

## 3. 实现思路 / Implementation Strategy

### 步骤 1: 升级数据转换工具 (Data Transformation)
在 `src/utils/ScoreUtils.ts` 中实现更智能的转换逻辑：
- `createScoreFromStudio(staves: StaffScore[], chatHistory: ChatRecord[]): Score`
- **逻辑**: 
    1.  遍历 Studio 的聊天记录。
    2.  对于每一条被“确认”生成了乐谱的输入，构建一个 `MusicSegmentInfo`。
    3.  提取其中的情感 (emotions) 和文本 (text)。
    4.  模拟生成音频路径 (目前阶段 Mock 为对应情感的音频文件)。
    5.  计算时间窗口 (根据当前时间倒推).
    6.  将 `StaffScore` 数组直接挂载。
    7.  自动生成 Title (基于 AI 对话的总结，或者默认 "My Creation").

### 步骤 2: 改造 Studio 模块 (Studio Refactoring)
- **修改文件**: `src/screens/StudioScreen.tsx`
- **逻辑**:
    - 在 `handleEndConversation` 或进入 `finished` 状态前，不仅要传递 `scores` (五线谱)，还要收集这期间所有的对话上下文。
    - 调用 `ScoreUtils.createScoreFromStudio` 生成标准的 `Score` 对象。
    - 将这个 `Score` 对象传递给 `StudioFinishedView`。

### 步骤 3: 改造 StudioFinishedView (UI Update)
- **修改文件**: `src/components/Studio/StudioFinishedView.tsx`
- **逻辑**:
    - `props` 从接收 `scores: StaffScore[]` 改为接收 `score: Score`。
    - 使用 `score.musicSegments` 来驱动播放进度条（之前是简单的 0-1 动画，现在可以基于真实时长）。
    - 标题和作者信息不再 Hardcode，而是从 `score` 对象读取。

## 4. 这里的关键点与疑问 (Q&A)

**Q1: 数据的真实来源是什么？**
A: 
- `text`: 来自用户在 Studio 输入的 `inputText`。
- `emotions`: 来自 `useStudioChat` 中调用 AI 分析返回的 `emotions` 数组。
- `audio`: 现阶段（无真实 MusicGen API），我们将根据情感（如 Joy）映射到本地的 `Joy.mp3` 资源。后续接入后端 API 后，这里填入后端返回的 URL。
- `staves`: 现有的 `StaffScoreToolkit` 生成逻辑保持不变。

**Q2: 如何保证数据一致性？**
A: `ScoreUtils` 将作为唯一的 factory。无论是在 Studio 创建新歌，还是从 Home 读取旧歌，最终流转到 UI 组件（DetailView/FinishedView）的数据类型 **严格统一为 `Score`**。

## 5. 文件变更列表 / File Changes

1.  `src/services/api.ts`: 完善 `Score` 和 `MusicSegmentInfo` 的定义。
2.  `src/utils/ScoreUtils.ts`: 新增 `createScoreFromStudio` 函数。
3.  `src/screens/StudioScreen.tsx`: 整合对话数据，调用转换函数。
4.  `src/components/Studio/StudioFinishedView.tsx`: 适配新的 `Score` 数据结构。
5.  `src/hooks/useStudioChat.ts`: (可能需要) 暴露更多对话历史信息供 Screen 层使用。

## 6. 规范性检查 / Compliance Check

- **代码结构**: 保持 Controller (Screen) 处理逻辑，View (Component) 只负责展示。数据转换逻辑下沉到 Utils。
- **类型安全**: 全程使用 TypeScript 接口，杜绝 `any`。
- **可测试性**: `ScoreUtils` 是纯函数，易于编写单元测试。

---
**确认**: 本文档符合您的要求吗？如果确认，我将开始按照此文档进行开发。
