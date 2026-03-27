## Why

`src/app/page.tsx` 当前超过 430 行，工具函数、纯 UI 子组件、API 调用逻辑、状态管理全部混写在同一文件中。随着功能增长，维护成本持续上升，且违反了项目约定的"业务逻辑与 UI 分离"原则。

## What Changes

- **提取** `sumCalories`、`formatTime` 工具函数到 `src/utils/calorie.ts`
- **提取** `StatCard` 纯 UI 组件到 `src/components/StatCard.tsx`
- **新增** `useCalorieTracker` 自定义 Hook，封装卡路里记录的加载、新增、编辑、删除逻辑及相关状态（替代页面内散落的 useState + useCallback）
- **新增** `ProfileSummaryCard` 组件，封装个人信息摘要展示逻辑（含 profile 数据派生、BMR 计算）
- **新增** `CalorieRecordList` 组件，封装记录列表 UI 及编辑/删除回调（含加载态、空态、错误态）
- **新增** `CalorieStatsGrid` 组件，封装 4 格统计卡片展示
- **重构** `page.tsx` 仅保留数据获取调用与组件组合，不含内联 UI 或业务逻辑

## Capabilities

### New Capabilities

- `home-page-components`: 主页业务组件集合（ProfileSummaryCard、CalorieStatsGrid、CalorieRecordList）及配套 Hook（useCalorieTracker）

### Modified Capabilities

（无需求层面变更，仅实现层重构）

## Impact

- 影响文件：`src/app/page.tsx`（大幅瘦身）
- 新增文件：
  - `src/utils/calorie.ts`（工具函数）
  - `src/components/StatCard.tsx`
  - `src/components/ProfileSummaryCard.tsx`
  - `src/components/CalorieStatsGrid.tsx`
  - `src/components/CalorieRecordList.tsx`
  - `src/hooks/useCalorieTracker.ts`
- 无 API 变更、无新增依赖、无破坏性变更
