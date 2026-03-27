## ADDED Requirements

### Requirement: calorieStore 管理卡路里条目全局状态

系统 SHALL 提供 `src/stores/calorieStore.ts` Zustand Store，包含 entries、loading、error、selectedDate 状态及对应 actions，供业务层调用。

#### Scenario: Store 初始包含默认状态

- **WHEN** 应用首次加载
- **THEN** Store 的 entries 为空数组，loading 为 false，error 为 null，selectedDate 为今日日期字符串

#### Scenario: fetchEntries action 加载指定日期条目

- **WHEN** 调用 fetchEntries(token, date)
- **THEN** Store 将 loading 设为 true，请求完成后更新 entries，loading 恢复 false

#### Scenario: fetchEntries 失败时记录错误

- **WHEN** 调用 fetchEntries(token, date) 且请求失败
- **THEN** Store 的 error 字段包含错误描述，loading 恢复 false，entries 不变

#### Scenario: addEntry action 成功创建后刷新列表

- **WHEN** 调用 addEntry(token, data)
- **THEN** Store 调用 createCalorieEntry，成功后重新执行 fetchEntries 刷新 entries

#### Scenario: editEntry action 成功更新后刷新列表

- **WHEN** 调用 editEntry(token, id, data)
- **THEN** Store 调用 updateCalorieEntry，成功后重新执行 fetchEntries 刷新 entries

#### Scenario: removeEntry action 成功删除后移除条目

- **WHEN** 调用 removeEntry(token, id)
- **THEN** Store 调用 deleteCalorieEntry，成功后从 entries 中移除该条目（乐观更新）

#### Scenario: setSelectedDate action 更新日期

- **WHEN** 调用 setSelectedDate(date)
- **THEN** Store 的 selectedDate 更新为指定日期字符串
