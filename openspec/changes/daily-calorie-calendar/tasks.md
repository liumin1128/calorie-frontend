## 1. 类型定义

- [x] 1.1 在 `types/calorie.ts` 中新增 `DailySummaryItem` 接口和 `DailySummaryMap` 类型

## 2. 服务层

- [x] 2.1 在 `services/calorieService.ts` 中新增 `getDailySummary(token, startDate, endDate)` 函数，调用 `GET /calorie/daily-summary`

## 3. 状态管理

- [x] 3.1 新建 `stores/dailySummaryStore.ts`，使用 zustand 管理月度摘要数据（currentMonth、summaryMap、loading、error）
- [x] 3.2 实现 sessionStorage 持久化缓存逻辑，key 包含年月标识
- [x] 3.3 实现 `fetchSummary(token, options?)` 方法，支持缓存读取和 `force` 强制刷新
- [x] 3.4 实现 `setMonth(month)` 方法，切换月份

## 4. 日历组件

- [x] 4.1 新建 `components/DailyCalorieCalendar.tsx`，实现月历网格布局（7列 × 5-6行）
- [x] 4.2 实现月份切换头部（上一月/下一月按钮 + 年月标题），禁止超过当月
- [x] 4.3 实现每日格子展示 totalIntake/totalBurn 数据，含净热量颜色提示
- [x] 4.4 实现加载中和错误状态展示

## 5. 首页集成

- [x] 5.1 在 `app/page.tsx` 中引入 `DailyCalorieCalendar`，放置在合适位置
- [x] 5.2 在 `useCalorieTracker` hook 中，记录增删改成功后调用 `dailySummaryStore.fetchSummary(token, { force: true })` 刷新日历

## 6. 验证

- [x] 6.1 构建验证编译通过
