## Why

首页目前仅展示单日卡路里概览，用户无法直观了解整月的摄入/消耗趋势。后端已提供 `GET /calorie/daily-summary` 接口（按日期范围聚合每日 totalIntake / totalBurn），需要在前端接入并以日历视图呈现，让用户一眼掌握月度健康数据。

## What Changes

- 新增 `dailySummaryService` 服务函数，调用 `GET /calorie/daily-summary?startDate=&endDate=` 获取月度数据
- 新增 `DailySummary` 类型定义
- 新增 `dailySummaryStore`（zustand），管理月度摘要数据，支持持久化缓存
- 新增 `DailyCalorieCalendar` 日历组件，以月历格式展示每日摄入/消耗数据，支持切换月份，默认展示当月
- 在首页 `page.tsx` 中放置该日历组件

## Capabilities

### New Capabilities

- `daily-calorie-calendar`: 月度卡路里日历展示组件，包含服务层、状态管理和日历 UI

### Modified Capabilities

- `home-page-components`: 首页新增日历组件区域

## Impact

- **类型**: `types/calorie.ts` 新增 `DailySummary` 类型
- **服务**: `services/calorieService.ts` 新增 `getDailySummary` 函数
- **状态**: `stores/` 新增 `dailySummaryStore.ts`
- **组件**: `components/` 新增 `DailyCalorieCalendar.tsx`
- **页面**: `app/page.tsx` 引入并放置日历组件
- **依赖**: 使用已有的 `@mui/x-date-pickers` 和 `dayjs`，无需新增依赖
