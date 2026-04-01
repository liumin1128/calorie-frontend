## ADDED Requirements

### Requirement: 服务层封装每日摘要接口

系统 SHALL 在 `services/calorieService.ts` 中提供 `getDailySummary(token, startDate, endDate)` 函数，调用 `GET /calorie/daily-summary`，返回 `DailySummaryMap` 类型数据。

#### Scenario: 成功获取月度摘要
- **WHEN** 调用 `getDailySummary(token, "2026-04-01", "2026-04-30")`
- **THEN** 系统向 `GET /calorie/daily-summary?startDate=2026-04-01&endDate=2026-04-30` 发送请求，返回 `Record<string, { totalIntake: number; totalBurn: number }>` 格式数据

#### Scenario: 接口请求失败时抛出错误
- **WHEN** 接口返回错误或网络异常
- **THEN** `getDailySummary` 抛出 Error，调用方可捕获并展示错误信息

### Requirement: DailySummary 类型定义

系统 SHALL 在 `types/calorie.ts` 中定义 `DailySummaryItem` 接口（含 `totalIntake`、`totalBurn` 字段）和 `DailySummaryMap` 类型（`Record<string, DailySummaryItem>`）。

#### Scenario: 类型与后端响应一致
- **WHEN** 后端返回 `{ "2026-04-01": { "totalIntake": 2400, "totalBurn": 500 } }`
- **THEN** 该数据 SHALL 符合 `DailySummaryMap` 类型定义

### Requirement: zustand store 管理月度摘要数据

系统 SHALL 提供 `dailySummaryStore`，包含当前选中月份、摘要数据、加载状态和错误状态，支持按月获取数据和切换月份。

#### Scenario: 首次获取当月数据
- **WHEN** store 初始化且无缓存数据时调用 `fetchSummary`
- **THEN** 系统调用 `getDailySummary` 获取当月数据并存入 store

#### Scenario: 切换月份获取数据
- **WHEN** 用户调用 `setMonth` 切换到目标月份
- **THEN** store 更新当前月份并调用 `fetchSummary` 获取该月数据

#### Scenario: 使用 sessionStorage 缓存数据
- **WHEN** 成功获取某月数据后
- **THEN** 系统将该月数据存入 sessionStorage，key 包含年月标识
- **WHEN** 再次请求同一月份数据且缓存存在
- **THEN** 系统直接从缓存读取，不发起网络请求

#### Scenario: 强制刷新数据
- **WHEN** 调用 `fetchSummary` 并传入 `force: true`
- **THEN** 系统忽略缓存，重新从接口获取数据

### Requirement: 日历组件展示月度卡路里数据

系统 SHALL 提供 `DailyCalorieCalendar` 组件，以月历网格形式展示每日摄入和消耗数据。

#### Scenario: 默认展示当月日历
- **WHEN** 组件渲染时
- **THEN** 默认展示当前月份的日历视图，标题显示「YYYY年M月」

#### Scenario: 日历网格布局
- **WHEN** 月历渲染时
- **THEN** 系统以 7 列（周一至周日）网格展示，每行对应一周，日期按自然排列

#### Scenario: 每日格子展示摄入和消耗数据
- **WHEN** 某日有卡路里记录
- **THEN** 该日格子内展示摄入（totalIntake）和消耗（totalBurn）数值

#### Scenario: 无数据日期展示
- **WHEN** 某日无卡路里记录
- **THEN** 该日格子仅展示日期数字，无数据标注

#### Scenario: 净热量颜色提示
- **WHEN** 某日净热量（摄入-消耗）为正
- **THEN** 格子背景使用偏红色调（热量盈余）
- **WHEN** 某日净热量为负或零
- **THEN** 格子背景使用偏绿色调（热量赤字或平衡）

#### Scenario: 切换上一月
- **WHEN** 用户点击上一月按钮
- **THEN** 日历切换到前一个月并加载该月数据

#### Scenario: 切换下一月
- **WHEN** 用户点击下一月按钮
- **THEN** 日历切换到后一个月并加载该月数据

#### Scenario: 不允许切换到未来月份
- **WHEN** 当前已展示本月
- **THEN** 下一月按钮 SHALL 禁用

#### Scenario: 加载中状态
- **WHEN** 数据正在加载
- **THEN** 日历区域展示加载指示器

#### Scenario: 加载失败
- **WHEN** 数据加载失败
- **THEN** 日历区域展示错误提示
