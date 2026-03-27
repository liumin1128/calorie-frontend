## MODIFIED Requirements

### Requirement: useCalorieTracker Hook 封装卡路里业务逻辑

系统 SHALL 提供 `src/hooks/useCalorieTracker.ts` 自定义 Hook，Hook 内部从 `calorieStore` 读写状态，对外接口 `UseCalorieTrackerReturn` 不变，组件层（包括 `ProfileSummaryCard`、`CalorieStatsGrid`、`CalorieRecordList`）无需修改。

#### Scenario: Hook 对外接口保持向后兼容

- **WHEN** 组件调用 useCalorieTracker()
- **THEN** 返回的对象包含与原实现完全相同的字段和方法签名

#### Scenario: 状态变更由 Store 驱动

- **WHEN** calorieStore 中的 entries 或 loading 更新
- **THEN** 使用该 Hook 的组件自动响应更新，无需额外 prop 传递
