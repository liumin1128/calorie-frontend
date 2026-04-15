## Why

饮食记录的查询和编辑功能未对齐后端最新数据模型。后端已支持 `water`、嵌套 `nutrition`、`minerals` 以及 `source` 字段，但前端在查询列表数据时未包含这些字段，编辑弹窗也未提供对应的输入控件。同时，不同来源（手动添加、AI 识别、条码扫描）的记录需要差异化的编辑体验。

## What Changes

- 前端类型定义新增 `source`（`EntrySource`）字段，对齐后端 `manual | healthkit` 枚举
- `CalorieEntry` 响应类型补全 `water`、`nutrition`、`minerals`、`source`、`externalId` 字段
- `CreateCalorieEntryDto` 补全 `source`、`externalId` 字段
- 编辑弹窗（`CreateRecordDialog`）根据记录来源展示不同编辑层级：
  - **手动添加 / AI 识别**：可编辑基本信息 + `nutrition`（蛋白质、碳水、脂肪、纤维）+ `water`，不含 `minerals`
  - **条码扫描**（`externalId` 存在）：展示完整营养信息（含 `minerals`）但全部只读，不允许编辑
- 列表 UI 不新增展示字段，保持当前精简样式

## Capabilities

### New Capabilities
- `nutrition-edit-dialog`: 编辑弹窗中按来源差异化展示和编辑营养信息（nutrition/water/minerals）

### Modified Capabilities
- `calorie-management`: 查询数据时包含完整营养字段；编辑入口传递完整数据
- `calorie-service`: DTO 类型补全 source/externalId/water/nutrition/minerals 字段

## Impact

- **类型定义** `src/types/calorie.ts`：CalorieEntry、CreateCalorieEntryDto、新增 EntrySource 类型
- **服务层** `src/services/calorieService.ts`：无逻辑变更，仅类型透传
- **组件** `src/components/CreateRecordDialog.tsx`：主要改动，新增营养编辑区域和只读模式
- **页面** `src/app/page.tsx`：编辑入口传递完整 CalorieEntry 数据
- **无后端变更**：后端已支持所有字段
