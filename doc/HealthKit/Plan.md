# HealthKit 数据接入与迁移计划

**目标**: 将 iOS 原生项目中的 HealthKit 数据获取逻辑迁移至 React Native，并实现根据真实健康数据驱动的 AI 对话与音乐生成。

## 1. 原生逻辑分析
在 iOS 项目中，数据来源主要是 `HealthKitManager`，负责获取：
- **睡眠数据**: `sleepAnalysis` (睡眠时长, 入睡时间, 醒来时间)
- **心率数据**: `heartRate` (静息心率, 变异性 HRV)
- **步数活动**: `stepCount`

这些数据被用来构建 `Prompt` 发送给 AI，AI 根据数据（如“昨晚睡得少”）生成特定的问候语。

## 2. React Native 技术选型
使用业界标准库 **`react-native-health`** (也称为 `rn-apple-healthkit`)。

## 3. 实施步骤

### 阶段一：基础集成 (Setup)
1.  **安装依赖**:
    ```bash
    npm install react-native-health
    cd ios && pod install
    ```
2.  **原生配置**:
    - 在 Xcode 中开启 Project Capability -> HealthKit。
    - 修改 `Info.plist`，添加隐私权限描述：
        - `NSHealthShareUsageDescription` (读取权限)
        - `NSHealthUpdateUsageDescription` (写入权限，如果需要)

### 阶段二：服务封装 (Service Wrap)
创建 `src/services/HealthService.ts`，以此屏蔽底层实现细节，并提供 Mock 支持。

```typescript
import AppleHealthKit, { HealthValue, HealthKitPermissions } from 'react-native-health';

// 统一数据接口
export interface HealthDailyReport {
    sleepHours: number;    // 睡眠总时长 (小时)
    avgHeartRate: number;  // 平均心率
    steps: number;         // 步数
    hrv?: number;          // 心率变异性 (可选)
}

export class HealthService {
    // 初始化权限
    static async initPermissions(): Promise<boolean> {
        // ...调用 AppleHealthKit.initHealthKit
    }

    // 获取综合日报
    static async getDailyReport(date: Date): Promise<HealthDailyReport> {
        // 并行请求各项数据
        // 1. getSleepSamples
        // 2. getHeartRateSamples
        // 3. getStepCount
        // 聚合返回
    }
}
```

### 阶段三：模拟模式 (Demo Mode Support)
为了方便开发和演示（以及审核时可能没有健康数据的情况），需要实现一个 Mock 适配器。

- 修改 `HealthService`，增加 `useMock: boolean` 标志。
- 当 `useMock = true` 或在模拟器运行时，直接返回 `DemoConversationData` 中预设的数值。

### 阶段四：业务对接 (Integration)
1.  **StudioScreen改造**:
    - 在进入 Studio 时 (`useEffect`)，调用 `HealthService.getDailyReport(today)`。
    - 将获取到的真实数据（如 "睡眠 4.2小时"）替换掉 AI Prompt 中的占位符。
    - 从而触发 AI 生成 "I noticed you didn't get much rest..." 这样真实的开场白。

## 4. 注意事项
- **真机调试**: HealthKit **不支持模拟器**，必须使用真机调试。
- **Android 支持**: `react-native-health` 仅限 iOS。如果将来需要支持 Android，需要引入 `react-native-google-fit` 并实现统一接口层。
- **隐私合规**: 必须处理用户拒绝授权的情况（降级为 Demo 数据或不显示相关话题）。

## 5. 待确认
- 是否需要支持写入健康数据（如冥想时间写入“正念分钟数”）？目前暂时只关注读取。

---
*本文档创建于 2026-01-22，作为后续 HealthKit 任务的执行蓝图。*
