## Context

当前前端卡路里首页使用硬编码模拟数据（`initialRecords`），所有操作仅在内存中进行。后端已提供完整的 `/calorie` CRUD REST API（NestJS + MongoDB），使用 JWT Bearer Token 认证，支持分页和按日期/类型筛选。

前端已有底层 HTTP 客户端（`lib/api.ts`）和认证上下文（`AuthContext`），但 `request` 函数未支持自动注入 token 和 query 参数。前端类型定义（`CalorieRecord`）与后端数据模型存在字段差异。

## Goals / Non-Goals

**Goals:**
- 对接后端卡路里 CRUD API，实现持久化的记录管理
- 增强 `request` 函数，支持 token 自动注入和 query 参数
- 类型定义对齐后端数据模型
- 首页移除模拟数据，通过 API 加载真实数据
- 支持创建、编辑、删除记录
- 支持按日期筛选记录

**Non-Goals:**
- 不引入状态管理库（Zustand/Redux）或数据获取库（TanStack Query），保持现有 React 内置状态管理方式
- 不实现图片上传功能（后端支持 `images` 字段，但前端暂不实现）
- 不实现无限滚动/虚拟列表等高级分页交互

## Decisions

### 1. 增强 `lib/api.ts` 的 `request` 函数

**决策**: 为 `request` 函数新增 `token` 和 `params`（query 参数）支持，通过 options 传入。

**理由**: 保持底层 HTTP 客户端的通用性，不与 AuthContext 耦合。token 由调用方（service 层）传入。

### 2. 新建 `services/calorieService.ts` 服务层

**决策**: 按项目约定在 `services/` 目录下新建 `calorieService.ts`，封装所有卡路里 API 调用。

**理由**: 遵循项目现有的代码组织约定（`services/` 按业务域拆分），组件不直接调用 fetch。

### 3. 类型映射策略

**决策**: 更新 `CalorieRecord` 类型对齐后端模型，使用后端字段名（`_id`、`title`、`entryDate`、`type: "intake"|"burn"`）。同时保留前端预设数据中 `food`/`exercise` 的映射。

**替代方案**: 在 service 层做字段转换，保持前端类型不变 —— 被拒绝，因为会增加不必要的转换层复杂度。

### 4. 首页数据加载策略

**决策**: 使用 `useEffect` + `useState` 在组件挂载时加载当天数据。使用日期选择器让用户切换查看日期。

**理由**: 符合项目当前不使用第三方数据获取库的约定，保持简单。

### 5. 编辑功能复用 CreateRecordDialog

**决策**: 将 `CreateRecordDialog` 改造为 `RecordDialog`，通过传入可选的 `initialData` prop 来区分创建和编辑模式。

**理由**: 创建和编辑的表单字段完全一致，复用可减少代码量。

## Risks / Trade-offs

- **[类型变更影响面]** → `CalorieRecord` 类型变更会影响所有引用处（首页、CreateRecordDialog），需要一次性完整迁移。变更范围可控（仅 2-3 个文件）。
- **[无离线支持]** → 网络不可用时无法操作记录 → 当前阶段可接受，后续可考虑乐观更新。
- **[无错误重试]** → API 调用失败后不自动重试 → 通过 UI 提示用户手动重试，保持实现简单。
