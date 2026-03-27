## Context

`src/app/page.tsx` 目前承担了过多职责：工具函数定义、纯 UI 子组件定义、API 调用与错误处理、多个 useState 状态管理、派生数据计算以及最终 JSX 拼装。文件超过 430 行，违反了项目"单文件职责单一、超过 200 行应考虑拆分"的规范。

本次为纯内部重构，不改变任何对外行为、API 接口或用户可见功能。

## Goals / Non-Goals

**Goals:**
- 将 `page.tsx` 瘦身至仅做数据获取 + 组件组合（目标 < 80 行）
- 提取自定义 Hook `useCalorieTracker` 集中管理卡路里相关状态与操作
- 将 3 块内联 UI（个人信息摘要、统计格、记录列表）各自封装为独立组件
- 将工具函数迁移至 `src/utils/calorie.ts`，可被跨模块复用

**Non-Goals:**
- 不修改任何 API 层 / services 层代码
- 不引入新的状态管理库（仍使用 React 内置 useState/useCallback）
- 不改变现有 UI 外观或交互行为
- 不对 `CreateRecordDialog`、`ProfileDialog` 做任何修改

## Decisions

### 决策 1：新增 `src/hooks/` 目录放置自定义 Hook

**选择**：创建 `src/hooks/useCalorieTracker.ts`，封装 token、loadEntries、handleSubmit、handleDelete、selectedDate 等所有卡路里追踪相关状态。

**理由**：符合项目"业务逻辑与 UI 分离，Hooks 封装业务状态"的约定；Hook 可独立测试；页面只需 `const tracker = useCalorieTracker()` 一行调用。

**替代方案**：Context 共享 → 过度设计，当前只有一个消费方；useState 内联 → 现状，是问题所在。

### 决策 2：ProfileSummaryCard 接收 profile 数据并自行派生

**选择**：`ProfileSummaryCard` 接收 `profile`、`profileLoading`、`onOpenProfile` 三个 props，内部完成 height/weight/age/bmr 派生逻辑。

**理由**：派生逻辑（calculateBMR、calculateAge）天然属于展示层关注点，不应上浮到页面；组件内部可独立处理 loading/empty 状态。

### 决策 3：CalorieRecordList 接收数据 + 回调，不持有 API 调用

**选择**：`CalorieRecordList` 接收 `entries`、`loading`、`error`、`onEdit`、`onDelete`、`onRetry` props，所有数据来自外部（Hook）。

**理由**：组件只负责渲染，符合"组件不直接调用 fetch"的项目规范；使 CalorieRecordList 可用于未来其他场景（如历史记录页）。

### 决策 4：StatCard 放入 components/ 作为通用展示组件

**选择**：独立为 `src/components/StatCard.tsx`，接收 title/value/unit/icon/color props。

**理由**：StatCard 是无状态纯渲染组件，与业务无耦合，适合放在 components/ 复用。

## Risks / Trade-offs

- **Props 接口需明确定义**：组件 props 类型必须用 `interface` 明确声明，避免隐式 any → 通过 TypeScript strict 模式在编译时保障
- **迁移后需确认行为一致**：重构前后 UI 展示和交互应完全一致 → 拆分时保持 JSX 结构不变，仅移动位置
