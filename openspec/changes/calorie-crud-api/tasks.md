## 1. 基础设施层

- [x] 1.1 增强 `lib/api.ts` 的 `request` 函数，支持 `token` 自动注入和 `params` query 参数拼接
- [x] 1.2 新增 `CalorieEntry` 类型定义（对齐后端模型），更新 `types/calorie.ts` 中前端类型映射

## 2. 服务层

- [x] 2.1 创建 `services/calorieService.ts`，实现 `createCalorieEntry` 函数
- [x] 2.2 实现 `getCalorieEntries` 函数（支持分页和日期/类型筛选）
- [x] 2.3 实现 `updateCalorieEntry` 函数
- [x] 2.4 实现 `deleteCalorieEntry` 函数

## 3. 组件改造

- [x] 3.1 改造 `CreateRecordDialog` 组件，适配后端字段（title、type: intake/burn、entryDate），支持编辑模式（通过 `initialData` prop）
- [x] 3.2 首页移除模拟数据，添加日期选择器，通过 API 加载指定日期的记录
- [x] 3.3 首页对接创建记录功能（调用 calorieService，成功后刷新列表）
- [x] 3.4 首页对接编辑记录功能（点击编辑按钮打开弹窗，提交后调用 API 更新）
- [x] 3.5 首页对接删除记录功能（调用 calorieService 删除后从列表移除）
- [x] 3.6 添加加载状态和错误提示（Loading、Error 状态 UI）
