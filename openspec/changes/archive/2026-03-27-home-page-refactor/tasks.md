## 1. 提取工具函数

- [x] 1.1 创建 `src/utils/calorie.ts`，迁入 `sumCalories(entries, type)` 和 `formatTime(entryDate)` 函数，添加 export

## 2. 提取纯 UI 组件

- [x] 2.1 创建 `src/components/StatCard.tsx`，将 StatCard 函数组件移入，定义 props interface，添加默认导出

## 3. 新增 useCalorieTracker Hook

- [x] 3.1 创建 `src/hooks/` 目录
- [x] 3.2 创建 `src/hooks/useCalorieTracker.ts`，将 page.tsx 中 entries、loading、error、selectedDate、dialogOpen、editingEntry 等状态迁入
- [x] 3.3 将 loadEntries（含 useCallback/useEffect）迁入 Hook
- [x] 3.4 将 handleSubmitRecord、handleDeleteRecord、handleOpenCreate、handleOpenEdit 迁入 Hook
- [x] 3.5 Hook 返回所有消费方需要的状态和方法，导出明确的返回类型 interface

## 4. 新增 ProfileSummaryCard 组件

- [x] 4.1 创建 `src/components/ProfileSummaryCard.tsx`，定义 props interface（profile, profileLoading, onOpenProfile）
- [x] 4.2 将 page.tsx 中个人信息摘要卡片的 JSX（含 height/weight/age/bmr 派生逻辑）迁入组件

## 5. 新增 CalorieStatsGrid 组件

- [x] 5.1 创建 `src/components/CalorieStatsGrid.tsx`，定义 props interface（intake, burn, bmr）
- [x] 5.2 将 page.tsx 中 Grid 统计格 JSX 迁入，组件内部计算 net，使用 StatCard 渲染

## 6. 新增 CalorieRecordList 组件

- [x] 6.1 创建 `src/components/CalorieRecordList.tsx`，定义 props interface（entries, loading, error, selectedDate, onEdit, onDelete, onRetry, onOpenCreate）
- [x] 6.2 将 page.tsx 中记录列表区域（标题栏 + 错误 Alert + loading/空态/列表 JSX）迁入组件，使用 formatTime 从 utils 导入

## 7. 重构 page.tsx

- [x] 7.1 清空 page.tsx 中已迁移的状态、工具函数、事件处理和内联 JSX
- [x] 7.2 调用 useCalorieTracker() 获取数据和方法
- [x] 7.3 用 ProfileSummaryCard、CalorieStatsGrid、CalorieRecordList 重组页面 JSX
- [x] 7.4 保留 Fab（浮动新增按钮）和 CreateRecordDialog、ProfileDialog 弹窗，确认 props 对接正确

## 8. 验证

- [x] 8.1 确认 TypeScript 无编译错误（所有文件）
- [x] 8.2 确认 page.tsx 不超过 80 行，不含工具函数定义（实际：78 行）
- [x] 8.3 确认各新增文件不超过 150 行（最大：CalorieRecordList 150 行）
- [x] 8.4 确认主页功能不变：日期切换、新增/编辑/删除记录、统计数据显示正确
