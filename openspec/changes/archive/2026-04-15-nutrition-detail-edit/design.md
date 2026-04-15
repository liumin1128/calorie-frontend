## Context

当前 `CreateRecordDialog` 仅编辑 4 个字段（type/title/calories/entryDate），后端数据模型已扩展至包含 `water`、嵌套 `nutrition`（protein/fat/carbohydrates/fiber）、`minerals`（13 种矿物质）、`source`（manual/healthkit）和 `externalId`。

前端 `CalorieEntry` 类型缺少 `source` 和 `externalId` 字段，无法区分记录来源。编辑弹窗需要根据来源决定哪些字段可编辑。

## Goals / Non-Goals

**Goals:**
- 类型定义完整对齐后端数据模型（source、externalId）
- 编辑弹窗按来源差异化展示：手动/AI 可编辑 nutrition+water；条码扫描只读
- 列表查询数据自然包含完整字段（后端默认返回，无需前端额外处理）

**Non-Goals:**
- 不改变列表 UI 展示样式
- 不新增条码扫描功能
- 不修改后端 API

## Decisions

### 1. 来源判断策略

**决定**：通过 `source` 字段直接判断记录来源。

**理由**：后端 `EntrySource` 已扩展为 `manual | healthkit | barcode | ai` 四个值，可以精确区分来源，无需间接推断。

| source 值 | 含义 | 编辑行为 |
|-----------|------|---------|
| `manual` | 手动添加 | 可编辑 nutrition + water |
| `ai` | AI 识别 | 可编辑 nutrition + water |
| `barcode` | 条码扫描 | 只读展示（含 minerals） |
| `healthkit` | HealthKit 同步 | 只读展示 |

### 2. 编辑层级设计

**决定**：编辑弹窗分两个层级：

| 来源 | 基本信息 | nutrition + water | minerals |
|------|---------|-------------------|----------|
| 手动添加 | 可编辑 | 可编辑 | 不显示 |
| AI 识别 | 可编辑 | 可编辑 | 不显示 |
| 条码扫描 | 可编辑(title/calories/entryDate) | 只读展示 | 只读展示 |

**理由**：手动和 AI 记录的营养数据精度有限，允许用户修正；条码数据来自权威食品数据库，展示但不建议修改。minerals 仅条码数据有值，手动/AI 不显示避免空白区域。

### 3. UI 布局

**决定**：营养编辑区域使用可折叠面板（Collapse），默认展开。

**理由**：
- 不增加弹窗初始高度压力
- 与 AiAnalysisPreview 的编辑展开区保持交互一致性
- 条码只读模式下自然呈现为信息面板

### 4. 字段映射

前端 `NutritionInfo` 已使用 `carbohydrates`（与后端一致）。新增字段直接透传，无需转换。

## Risks / Trade-offs

- **[字段未持久化]** → AI 分析流程（AiAnalysisPreview）已在上一次改动中对齐了 nutrition 结构，可正常保存
- **[条码记录识别准确性]** → `externalId` 为稀疏索引字段，仅条码记录有值，判断可靠
- **[弹窗复杂度增加]** → CreateRecordDialog 代码量增加，但通过条件渲染控制，不影响简单记录的快速录入体验
