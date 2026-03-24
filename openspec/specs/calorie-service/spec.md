## ADDED Requirements

### Requirement: HTTP 客户端支持 Token 自动注入
`lib/api.ts` 的 `request` 函数 SHALL 支持通过 options 传入 `token` 参数，自动附加 `Authorization: Bearer <token>` 请求头。

#### Scenario: 传入 token 时自动附加认证头
- **WHEN** 调用 `request` 时传入 `token` 参数
- **THEN** 请求头中 SHALL 包含 `Authorization: Bearer <token>`

#### Scenario: 未传入 token 时不附加认证头
- **WHEN** 调用 `request` 时未传入 `token` 参数
- **THEN** 请求头中 SHALL 不包含 `Authorization` 字段

### Requirement: HTTP 客户端支持 Query 参数
`request` 函数 SHALL 支持通过 options 传入 `params` 对象，自动拼接为 URL query string。

#### Scenario: 传入 params 时拼接到 URL
- **WHEN** 调用 `request("/calorie", { params: { page: 1, type: "intake" } })`
- **THEN** 实际请求 URL SHALL 为 `/calorie?page=1&type=intake`

#### Scenario: params 中值为 undefined 的字段被忽略
- **WHEN** 传入 `params: { page: 1, type: undefined }`
- **THEN** 实际请求 URL SHALL 为 `/calorie?page=1`

### Requirement: 创建卡路里记录
`calorieService` SHALL 提供 `createCalorieEntry` 函数，调用 `POST /calorie` 创建新记录。

#### Scenario: 成功创建记录
- **WHEN** 调用 `createCalorieEntry(token, { type: "intake", calories: 500, title: "早餐", entryDate: "2026-03-23T08:00:00Z" })`
- **THEN** SHALL 发送 POST 请求到 `/calorie`，请求体包含上述字段，返回创建的记录对象

### Requirement: 查询卡路里记录列表
`calorieService` SHALL 提供 `getCalorieEntries` 函数，调用 `GET /calorie` 获取记录列表，支持分页和筛选。

#### Scenario: 按日期范围查询
- **WHEN** 调用 `getCalorieEntries(token, { startDate: "2026-03-23", endDate: "2026-03-23" })`
- **THEN** SHALL 发送 GET 请求到 `/calorie?startDate=2026-03-23&endDate=2026-03-23`，返回 `{ data: CalorieEntry[], total: number }`

#### Scenario: 无筛选条件时获取全部
- **WHEN** 调用 `getCalorieEntries(token)` 不传筛选参数
- **THEN** SHALL 返回默认分页结果（page=1, pageSize=20）

### Requirement: 更新卡路里记录
`calorieService` SHALL 提供 `updateCalorieEntry` 函数，调用 `PATCH /calorie/:id` 更新指定记录。

#### Scenario: 部分更新记录
- **WHEN** 调用 `updateCalorieEntry(token, id, { calories: 600 })`
- **THEN** SHALL 发送 PATCH 请求到 `/calorie/<id>`，请求体仅包含需要更新的字段，返回更新后的完整记录

### Requirement: 删除卡路里记录
`calorieService` SHALL 提供 `deleteCalorieEntry` 函数，调用 `DELETE /calorie/:id` 删除指定记录。

#### Scenario: 成功删除记录
- **WHEN** 调用 `deleteCalorieEntry(token, id)`
- **THEN** SHALL 发送 DELETE 请求到 `/calorie/<id>`，返回被删除的记录对象

### Requirement: 类型定义对齐后端模型
`CalorieEntry` 类型 SHALL 对齐后端数据模型，包含 `_id`、`userId`、`type`（"intake"|"burn"）、`calories`、`title`、`description?`、`images?`、`entryDate`、`createdAt`、`updatedAt` 字段。

#### Scenario: 类型包含所有后端字段
- **WHEN** 定义 `CalorieEntry` 类型
- **THEN** SHALL 包含 `_id: string`、`userId: string`、`type: "intake" | "burn"`、`calories: number`、`title: string`、`description?: string`、`images?: string[]`、`entryDate: string`、`createdAt: string`、`updatedAt: string`
