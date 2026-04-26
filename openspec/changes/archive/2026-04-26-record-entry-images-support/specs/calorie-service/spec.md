## MODIFIED Requirements

### Requirement: 创建卡路里记录
`calorieService` SHALL 提供 `createCalorieEntry` 函数，调用 `POST /calorie` 创建新记录，并支持随请求提交图片 URL 数组。

#### Scenario: 成功创建记录
- **WHEN** 调用 `createCalorieEntry(token, { type: "intake", calories: 500, title: "早餐", entryDate: "2026-03-23T08:00:00Z" })`
- **THEN** SHALL 发送 POST 请求到 `/calorie`，请求体包含上述字段，返回创建的记录对象

#### Scenario: 创建时提交图片地址
- **WHEN** 调用 `createCalorieEntry` 时传入 `images: ["https://cdn.example.com/a.jpg"]`
- **THEN** 请求体 SHALL 原样包含 `images` 字段
- **THEN** 返回记录对象 SHALL 保留该图片地址用于前端回显

### Requirement: 更新卡路里记录
`calorieService` SHALL 提供 `updateCalorieEntry` 函数，调用 `PATCH /calorie/:id` 更新指定记录，并支持更新 `images` 字段。

#### Scenario: 部分更新记录
- **WHEN** 调用 `updateCalorieEntry(token, id, { calories: 600 })`
- **THEN** SHALL 发送 PATCH 请求到 `/calorie/<id>`，请求体仅包含需要更新的字段，返回更新后的完整记录

#### Scenario: 更新记录图片
- **WHEN** 调用 `updateCalorieEntry(token, id, { images: [] })` 或传入新的图片 URL 数组
- **THEN** 请求体 SHALL 包含更新后的 `images` 值
- **THEN** 返回结果 SHALL 反映新的图片状态

### Requirement: 类型定义对齐后端模型
`CalorieEntry` 类型 SHALL 对齐后端数据模型，包含 `_id`、`userId`、`type`（"intake"|"burn"）、`calories`、`title`、`description?`、`images?`、`entryDate`、`createdAt`、`updatedAt` 字段。

#### Scenario: 类型包含所有后端字段
- **WHEN** 定义 `CalorieEntry` 类型
- **THEN** SHALL 包含 `_id: string`、`userId: string`、`type: "intake" | "burn"`、`calories: number`、`title: string`、`description?: string`、`images?: string[]`、`entryDate: string`、`createdAt: string`、`updatedAt: string`
- **THEN** SHALL 包含 `source?: EntrySource`（"manual" | "healthkit" | "barcode" | "ai"）和 `externalId?: string` 可选字段
- **THEN** SHALL 包含 `water?: number`、`nutrition?: NutritionInfo`（protein、carbohydrates、fat、fiber）和 `minerals?: MineralsInfo` 可选字段

#### Scenario: CreateCalorieEntryDto 支持提交完整数据
- **WHEN** 前端创建或更新记录
- **THEN** CreateCalorieEntryDto SHALL 包含可选的 source 和 externalId 字段
- **THEN** CreateCalorieEntryDto SHALL 包含可选的 water、nutrition、minerals 和 images 字段
- **THEN** UpdateCalorieEntryDto 自动继承新增字段（Partial 类型）

## ADDED Requirements

### Requirement: 对象存储上传服务封装
前端 SHALL 提供独立的对象存储上传服务，负责请求预签名上传地址、上传图片文件并返回最终可写入记录的公开 URL。

#### Scenario: 获取预签名上传信息
- **WHEN** 前端请求图片上传能力
- **THEN** 系统 SHALL 调用后端 `POST /storage/presign-upload`
- **THEN** 请求体 SHALL 包含 `businessType`、`fileName` 与 `contentType`

#### Scenario: 上传成功返回图片 URL
- **WHEN** 对象存储 `PUT` 上传成功且后端返回 `publicUrl`
- **THEN** 前端上传服务 SHALL 返回该 URL 供记录创建/更新接口使用

#### Scenario: 无公开地址时阻止保存
- **WHEN** 预签名响应未提供可用的 `publicUrl`
- **THEN** 前端上传服务 SHALL 抛出错误，避免向记录接口提交无效图片地址