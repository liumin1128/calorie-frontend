## Context

首页当前展示单日卡路里数据（通过 DatePicker 选日期）。后端 `GET /calorie/daily-summary` 接口接受 `startDate`/`endDate` 参数，返回 `Record<string, { totalIntake: number; totalBurn: number }>`，即日期到摄入/消耗汇总的映射。需要新增日历组件在首页展示月度数据全貌。

## Goals / Non-Goals

**Goals:**
- 封装 `getDailySummary` 服务函数调用后端接口
- 使用 zustand store 管理月度摘要数据，支持 `sessionStorage` 持久化
- 实现日历组件：网格形式展示当月每日数据，可切换上/下月
- 组件与业务逻辑分离：日历组件只接收数据和回调，不直接调用 service

**Non-Goals:**
- 不实现点击日期跳转详情
- 不实现周视图或年视图
- 不修改后端 API

## Decisions

### 1. 日历 UI 使用纯 MUI 手写实现

**选择**: 使用 MUI `Grid`/`Box` + `dayjs` 手写日历网格
**理由**:
- 项目已有 `dayjs` 和 `@mui/material`，无需新增依赖
- 自定义程度高，可在每个日期格子内灵活展示摄入/消耗数据
- MUI `DateCalendar` 组件不支持在格子内嵌入自定义数据展示

### 2. zustand store + sessionStorage 持久化

**选择**: 独立 `dailySummaryStore.ts`，使用 sessionStorage 缓存当前月数据
**理由**:
- 与现有 `healthAdviceStore` 的 sessionStorage 缓存模式一致
- 避免切换月份时重复请求同一月份数据
- sessionStorage 关闭标签页即清空，不会造成数据过期问题
- 缓存 key 包含年月，支持多月份数据独立缓存

### 3. 日历格显示净热量色彩提示

**选择**: 每日格子显示摄入、消耗数值，并根据净热量（摄入-消耗）使用颜色区分
**理由**:
- 绿色表示消耗大于摄入（热量赤字），红色表示摄入大于消耗（热量盈余）
- 直观让用户识别哪些天"吃多了"

### 4. 组件与逻辑分离

**选择**: `DailyCalorieCalendar` 纯展示组件，接收 `data`、`currentMonth`、`onMonthChange` 等 props；首页通过 store 获取数据后传入
**理由**:
- 遵循项目约定：组件不直接调用 service，业务逻辑与 UI 分离

## Risks / Trade-offs

- **[大月份数据量]** → 每月最多 31 天的聚合数据，数据量极小，无性能风险
- **[sessionStorage 大小限制]** → 单月数据约 1KB，远低于 5MB 限制
- **[手写日历维护成本]** → 日历逻辑固定（7列×5-6行），复杂度可控
