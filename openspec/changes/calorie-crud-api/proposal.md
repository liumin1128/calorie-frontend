## Why

当前首页的卡路里记录完全使用硬编码的模拟数据，无法持久化，也无法跨设备同步。后端已提供完整的卡路里 CRUD REST API（`/calorie`），需要将前端对接后端 API，实现真实的卡路里记录管理功能。

## What Changes

- 新增 `calorieService` 服务层，封装卡路里记录的增删改查 API 调用
- 更新 `lib/api.ts` 的 `request` 函数，支持自动附加 JWT Token 和 query 参数
- 更新 `CalorieRecord` 类型定义，对齐后端数据模型（`_id`、`type: "intake"|"burn"`、`title`、`entryDate` 等字段）
- 改造首页（`page.tsx`），移除模拟数据，通过 API 获取真实记录并管理状态
- 改造 `CreateRecordDialog` 组件，适配后端 API 字段（`title`、`type`、`entryDate`）
- 新增编辑记录功能，复用 `CreateRecordDialog` 或新建编辑弹窗
- 支持删除记录时调用后端 API
- 支持按日期筛选和分页加载记录

## Capabilities

### New Capabilities
- `calorie-service`: 卡路里 API 服务层，封装 CRUD 操作（创建、列表查询、更新、删除）
- `calorie-management`: 首页卡路里记录管理功能，包括记录的展示、新增、编辑、删除，以及按日期筛选

### Modified Capabilities

## Impact

- `src/lib/api.ts`: 增强 `request` 函数，支持 token 自动注入和 query 参数
- `src/types/calorie.ts`: 更新 `CalorieRecord` 类型，对齐后端数据模型
- `src/app/page.tsx`: 移除模拟数据，接入真实 API
- `src/components/CreateRecordDialog.tsx`: 适配后端字段，支持编辑模式
- 新增 `src/services/calorieService.ts`: 卡路里 API 服务
