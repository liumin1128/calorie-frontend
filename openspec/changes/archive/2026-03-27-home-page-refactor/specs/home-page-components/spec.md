## ADDED Requirements

### Requirement: useCalorieTracker Hook 封装卡路里业务逻辑

系统 SHALL 提供 `src/hooks/useCalorieTracker.ts` 自定义 Hook，封装卡路里记录的数据加载、创建、编辑、删除及相关状态，组件层不得直接调用 calorieService 函数。

#### Scenario: Hook 初始化并加载当日数据

- **WHEN** 组件挂载且 token 可用
- **THEN** Hook 自动加载当前 selectedDate 的记录，期间 loading 为 true，完成后 loading 为 false

#### Scenario: 切换日期触发重新加载

- **WHEN** selectedDate 变更
- **THEN** Hook 重新请求对应日期的数据，entries 更新为新结果

#### Scenario: 创建记录成功后刷新列表

- **WHEN** 调用 Hook 暴露的 handleSubmit(data) 且无 editingEntry
- **THEN** 调用 createCalorieEntry，成功后重新加载列表

#### Scenario: 编辑记录成功后刷新列表

- **WHEN** 调用 handleSubmit(data) 且 editingEntry 不为 null
- **THEN** 调用 updateCalorieEntry，成功后重新加载列表

#### Scenario: 删除记录后列表即时更新

- **WHEN** 调用 handleDelete(id)
- **THEN** 调用 deleteCalorieEntry，成功后从 entries 中移除该条目

#### Scenario: 加载失败时暴露错误信息

- **WHEN** getCalorieEntries 请求失败
- **THEN** Hook 的 error 字段包含错误描述字符串，loading 恢复 false

### Requirement: ProfileSummaryCard 组件封装个人信息摘要

系统 SHALL 提供 `src/components/ProfileSummaryCard.tsx` 组件，接收 profile 和 profileLoading，内部完成数据派生与展示，页面层不包含个人信息相关的 UI 代码。

#### Scenario: profile 加载中显示占位符

- **WHEN** profileLoading 为 true
- **THEN** 组件显示加载指示器

#### Scenario: profile 完整时展示摘要信息

- **WHEN** profile 含有效 height、weight、birthday
- **THEN** 组件展示性别、年龄、身高、体重、基础代谢 Chip 列表

#### Scenario: profile 不完整时提示去设置

- **WHEN** profile 缺少 height 或 weight 或 birthday
- **THEN** 组件展示提示文案和「去设置」按钮，点击触发 onOpenProfile 回调

### Requirement: CalorieStatsGrid 组件展示卡路里统计

系统 SHALL 提供 `src/components/CalorieStatsGrid.tsx` 组件，接收 intake、burn、bmr 数值，自行计算 net 并展示 4 格统计卡片，页面层不包含统计计算逻辑。

#### Scenario: 正常展示四格数据

- **WHEN** 传入有效的 intake、burn、bmr
- **THEN** 组件展示饮食摄入、运动消耗、基础代谢、净卡路里四格卡片

#### Scenario: 净卡路里正负颜色区分

- **WHEN** net（intake - burn - bmr）≥ 0
- **THEN** 净卡路里显示为警示色（error）；否则显示为积极色（success）

### Requirement: CalorieRecordList 组件封装记录列表 UI

系统 SHALL 提供 `src/components/CalorieRecordList.tsx` 组件，接收 entries、loading、error 及操作回调，負责完整的列表 UI 渲染，页面层不包含记录列表相关的 JSX。

#### Scenario: 加载中显示占位符

- **WHEN** loading 为 true
- **THEN** 组件显示居中 CircularProgress

#### Scenario: 空列表显示提示

- **WHEN** loading 为 false 且 entries 为空
- **THEN** 组件显示「暂无记录」提示文案

#### Scenario: 展示记录列表

- **WHEN** entries 非空
- **THEN** 每条记录展示时间、类型 Chip、标题、卡路里数值及编辑/删除按钮

#### Scenario: 点击编辑触发回调

- **WHEN** 用户点击某条记录的编辑按钮
- **THEN** 组件调用 onEdit(entry) 回调，不自行处理弹窗逻辑

#### Scenario: 点击删除触发回调

- **WHEN** 用户点击某条记录的删除按钮
- **THEN** 组件调用 onDelete(entry._id) 回调，不自行调用 API

#### Scenario: 错误状态显示提示和重试

- **WHEN** error 不为 null
- **THEN** 组件显示 Alert 错误信息及「重试」按钮，点击触发 onRetry 回调

### Requirement: 主页 page.tsx 职责精简

系统 SHALL 确保 `src/app/page.tsx` 仅做数据获取调用与组件组装，不包含内联 UI 逻辑、工具函数定义或直接的 API 调用。

#### Scenario: 页面通过 Hook 获取数据

- **WHEN** 页面渲染
- **THEN** 页面调用 useCalorieTracker 取得所有业务数据和操作函数，不直接调用 calorieService

#### Scenario: 页面组合业务组件

- **WHEN** 页面渲染
- **THEN** 页面通过 ProfileSummaryCard、CalorieStatsGrid、CalorieRecordList 组合 UI，自身不含记录列表、统计格或个人信息摘要的内联 JSX

### Requirement: 工具函数迁移至 utils 层

系统 SHALL 将 sumCalories 和 formatTime 提取至 `src/utils/calorie.ts`，页面和组件通过 import 使用，不在组件文件中定义工具函数。

#### Scenario: 工具函数可跨模块导入

- **WHEN** 任意组件或 Hook 需要 sumCalories 或 formatTime
- **THEN** 从 `@/utils/calorie` 导入，函数为纯函数无副作用
