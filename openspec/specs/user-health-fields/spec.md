## ADDED Requirements

### Requirement: 类型定义支持目标体重和健康状况字段

`UserFullProfile` 和 `UpdateProfileDto` 类型 SHALL 包含 `targetWeight`（可选数字）和 `healthConditions`（可选字符串数组）字段，确保类型系统与后端 API 保持一致。

#### Scenario: 接口响应类型覆盖新字段
- **WHEN** 前端调用 `GET /user/full-profile`
- **THEN** `UserFullProfile.targetWeight` 和 `UserFullProfile.healthConditions` 字段可被 TypeScript 正确推断，无类型错误

#### Scenario: 更新请求 DTO 支持新字段
- **WHEN** 前端调用 `PUT /user/profile` 时传入 `targetWeight` 或 `healthConditions`
- **THEN** `UpdateProfileDto` 类型允许这两个可选字段，不产生编译错误

### Requirement: ProfileDialog 展示并编辑目标体重

系统 SHALL 在「个人信息设置」弹窗中提供目标体重输入控件，允许用户输入 30–300 kg 范围内的数值，打开弹窗时自动回填已保存的值。

#### Scenario: 回填已有目标体重
- **WHEN** 用户打开 ProfileDialog 且 profile 中存在 `targetWeight`
- **THEN** 目标体重输入框显示已保存的数值

#### Scenario: 目标体重为空时不提交
- **WHEN** 用户未填写目标体重（输入框为空或值 ≤ 0）并点击保存
- **THEN** 提交的 payload 中不包含 `targetWeight` 字段

#### Scenario: 成功保存目标体重
- **WHEN** 用户输入有效目标体重（30–300）并点击保存
- **THEN** 系统将 `targetWeight` 随其他字段一起通过 `PUT /user/profile` 提交，成功后刷新 profile

### Requirement: ProfileDialog 展示并编辑健康状况标签

系统 SHALL 在「个人信息设置」弹窗中提供健康状况标签输入区域，用户可通过输入后按 Enter 添加标签、点击标签关闭删除标签，打开弹窗时自动回填已保存的标签列表。

#### Scenario: 回填已有健康状况标签
- **WHEN** 用户打开 ProfileDialog 且 profile 中存在 `healthConditions`
- **THEN** 健康状况区域以 Chip 形式展示每个已保存的标签

#### Scenario: 添加健康状况标签
- **WHEN** 用户在健康状况输入框输入文字并按下 Enter 键
- **THEN** 新标签以 Chip 形式添加到列表，输入框清空

#### Scenario: 单项标签超长时不添加
- **WHEN** 用户输入超过 50 个字符并尝试添加
- **THEN** 系统不添加该标签，输入框显示错误提示

#### Scenario: 删除健康状况标签
- **WHEN** 用户点击某个标签 Chip 上的关闭按钮
- **THEN** 该标签从列表中移除

#### Scenario: 健康状况列表为空时不提交该字段
- **WHEN** 用户清空所有标签并点击保存
- **THEN** 提交的 payload 中 `healthConditions` 为空数组（由后端处理）

#### Scenario: 成功保存健康状况
- **WHEN** 用户添加或修改健康状况标签并点击保存
- **THEN** 系统将 `healthConditions` 数组随其他字段一起通过 `PUT /user/profile` 提交，成功后刷新 profile
