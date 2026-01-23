# 收藏室 (Collection Room) 迁移计划

## 1. 任务目标
将 iOS 项目中的 `Feature/CollectionRoom` 完整迁移到 React Native 项目 (`Mynote_RN`) 中。
目标是完美复刻 iOS 版本的视觉效果（"Wowed at first glance"）和交互逻辑。

## 2. 核心功能模块

### A. 收藏室主页面 (`CollectionScreen`)
- **视觉**: 纵向长滚动页面，背景为长图 `CollectionRoomViewBack`。
- **布局**:
  - 动态显示过去7天的创作记录，分为4组 (`group1` - `group4`)。
  - 每组音符 (`Note Icons`) 使用绝对定位放置在背景特定位置。
  - "Begin" 按钮位于底部右侧。
  - 顶部动态显示日期范围文本。
- **交互**:
  - **可见性检测**: 当某组滚动到屏幕可见区域时，自动弹出 AI 总结气泡。
  - **点击交互**: 点击音符或区域可手动切换气泡显示/隐藏。
  - **空状态**: 无数据时显示 `CollectionRoomView_NoDataPop`。

### B. 收藏室详情页 (`CollectionDetailScreen`)
- **入口**: 点击主页面的 "Begin" 按钮进入。
- **功能**: 展示音乐和情绪的详细分析。
- **Tabs**:
  - **今日 (Today)**: 展示今日创作的音乐和情绪。
  - **每周 (Weekly)**: 展示本周聚合数据和 AI 生成的周歌曲。
  - **全部 (All)**: 展示历史总聚合及 "All-time" 歌曲。
- **卡片组件**:
  - **音乐详情**: 播放器 (进度条, 播放/暂停), 作曲者信息.
  - **情绪节奏**: 五线谱可视化展示情绪变化.
  - **情绪旋律**: 彩虹桥图表展示情绪分布.
  - **情绪音符**: 柱状图展示主要情绪.

## 3. 技术实现思路

### 3.1 目录结构调整
为了保持与现有项目结构 (`components/Studio`, `screens/`, `utils/`) 的高度一致性，我们将按以下方式组织代码，而不是创建新的 `features` 根目录：

```
src/
  components/
    Collection/              # 新建目录，存放收藏室专用组件
      NoteGroup.tsx          # 音符组组件
      DialogBox.tsx          # 对话框组件
      VisibilityDetector.tsx # 可见性检测组件
      DetailCards/           # 详情页卡片
        MusicDetailCard.tsx
        EmotionRhythmCard.tsx
        EmotionMelodyCard.tsx
        EmotionNotesCard.tsx
  screens/
    CollectionScreen.tsx         # 主页面 (修改现有)
    CollectionDetailScreen.tsx   # 详情页 (新建)
  hooks/
    useCollectionData.ts         # 数据处理 Hook (新建)
  utils/
    CollectionDataUtils.ts       # 数据聚合核心逻辑 (新建)
```

### 3.2 数据层 (ViewModel 迁移)
- **数据源**: 使用 `coreApi.getScores()` 获取所有创作 (`Score` / `MyNoteCreation`)。
- **本地聚合 (核心逻辑)**: 新建 `src/utils/CollectionDataUtils.ts` 移植 `DayGroupSummary.generateGroups` 逻辑：
  - **输入**: `Score[]` 列表。
  - **处理**:
    1. 生成过去7天的日期序列。
    2. 将 `Score` 按 `createdDate` 映射到每一天。
    3. 按规则分组：Group 1 (7-6天前), Group 2 (5-4天前), Group 3 (前天昨天), Group 4 (今天)。
    4. **计算主导情绪**: 统计组内所有 `MusicSegment` 的 emotion，选出频率最高的，决定气泡颜色。
    5. **生成音符**: 统计组内 segment 总数，生成对应数量的 `noteIcons` (e.g. `Staff_Joy_1`) 供 UI 渲染。
  - **输出**: `DayGroupSummary[]` 数组。

### 3.3 关键技术点
- **长图定位**: 使用 `ImageBackground` 配合百分比绝对定位 (`position: absolute; top: 24%; left: 12%`) 复刻 iOS 的 `GeometryReader` 布局。
- **可见性检测**: 使用 `ScrollView` 的 `onScroll` 事件结合 `measure` 或 `View` 的 `onLayout` 来判断元素由于滚动位置是否可见。或者利用 `react-native-inviewport` (如果允许引入库) 或自行实现简单的 Y 轴检测逻辑。
- **SVG 支持**: 使用 `react-native-svg` 渲染 `Staff_*.svg` 图标，或者如果资源是 PNG 则直接使用 `Image`。
- **动画**: 使用 `react-native-reanimated` 制作气泡弹出 (`Scale + Fade`) 和滚动微交互。

## 4. 迁移步骤

### 第一阶段：基础建设与资源准备 (Phase 1)
1.  **资源检查**: 确认所有图片 (`CollectionRoomViewBack`, `Staff_*.svg` 等) 已导入 RN 项目。
2.  **导航配置**: 在 `AppNavigator` 或 `MainStack` 中注册 `CollectionDetailScreen`。
3.  **数据层移植**:
    - 新建 `src/utils/CollectionDataUtils.ts`。
    - 定义 `DayGroupSummary`, `WeeklyAggregation` 接口。
    - 实现 `generateDayGroups(scores: Score[])` 函数，确保能正确根据日期分组并计算情绪。
    - 编写简单的单元测试或 Log 验证分组逻辑正确性。

### 第二阶段：主页面开发 (Phase 2)
1.  **静态布局**: 实现 `CollectionScreen` 背景和 "Begin" 按钮。
2.  **分组渲染**: 实现 `CollectionNoteGroup`，支持传入位置参数渲染音符。
3.  **可见性逻辑**: 实现滚动监听，触发气泡显示。
4.  **数据接入**: 实现 `useCollectionData` Mock 数据或真实 API 对接。

### 第三阶段：详情页开发 (Phase 3)
1.  **框架搭建**: 详情页背景、自定义 Header、Tab 切换逻辑。
2.  **卡片实现**: 依次实现 4 个数据卡片 (Music, Rhythm, Melody, Notes)。
3.  **图表绘制**: 使用 `react-native-svg` 绘制彩虹桥和五线谱。

### 第四阶段：整合与优化 (Phase 4)
1.  **音乐播放**: 对接 `react-native-sound` 或现有播放服务。
2.  **交互打磨**: 添加转场动画、点击反馈。
3.  **真机调试**: 在 iOS 真机上验证布局适配 (SafeArea 等)。
4.  **数据验证**: 确保“无数据”和“有数据”两种状态下的显示逻辑正确（如 `noDataPopup` 的显示条件）。

## 5. 待确认问题
1.  **SVG 库**: 项目是否已集成 `react-native-svg`？(如果没有，可能需要安装或暂时使用 PNG)。
2.  **导航结构**: `CollectionDetailScreen` 是否应该是全屏 Modal 还是 Push 页面？(iOS 看起来是 Push 但隐藏了 TabBar)。
3.  **音乐 API**: 详情页的音乐播放 URL 是否直接从 `Score` 对象中获取？

这个计划旨在保证像素级还原 iOS 设计，同时保持 RN 代码的整洁和可维护性。