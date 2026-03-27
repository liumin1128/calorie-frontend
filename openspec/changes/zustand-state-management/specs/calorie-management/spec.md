## MODIFIED Requirements

### Requirement: useCalorieTracker Hook 封装卡路里业务逻辑

系统 SHALL 提供 `src/hooks/useCalorieTracker.ts` 自定义 Hook，封装卡路里记录的数据加载、创建、编辑、删除及相关状态；实现层从 `calorieStore` 读写状态，Hook 对外接口 `UseCalorieTrackerReturn` 保持不变，组件层无需修改。

#### Scenario: Hook 初始化并加载当日数据

- **WHEN** 组件挂载且 token 可用
- **THEN** Hook 触发 calorieStore.fetchEntries，期间 loading 为 true，完成后 loading 为 false

#### Scenario: 切换日期触发重新加载

- **WHEN** selectedDate 变更
- **THEN** Hook 调用 calorieStore.fetchEntries 重新请求，entries 更新为新结果

#### Scenario: 创建记录成功后刷新列表

- **WHEN** 调用 Hook 暴露的 handleSubmit(data) 且无 editingEntry
- **THEN** 调用 calorieStore.addEntry，成功后 entries 自动刷新

#### Scenario: 编辑记录成功后刷新列表

- **WHEN** 调用 handleSubmit(data) 且 editingEntry 不为 null
- **THEN** 调用 calorieStore.editEntry，成功后 entries 自动刷新

#### Scenario: 删除记录后列表即时更新

- **WHEN** 调用 handleDelete(id)
- **THEN** 调用 calorieStore.removeEntry，entries 中对应条目即时移除

#### Scenario: 加载失败时暴露错误信息

- **WHEN** fetchEntries 请求失败
- **THEN** Hook 的 error 字段包含错误描述字符串，loading 恢复 false
