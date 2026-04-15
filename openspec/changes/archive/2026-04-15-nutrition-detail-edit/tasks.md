## 1. 类型定义对齐

- [x] 1.1 在 `types/calorie.ts` 中新增 `EntrySource` 类型（`manual | healthkit`）
- [x] 1.2 在 `CalorieEntry` 中补全 `source?: EntrySource` 和 `externalId?: string` 字段
- [x] 1.3 在 `CreateCalorieEntryDto` 中补全 `source?: EntrySource` 和 `externalId?: string` 字段

## 2. 编辑弹窗营养信息编辑

- [x] 2.1 在 `CreateRecordDialog` 中新增 nutrition 编辑区域（蛋白质、碳水、脂肪、纤维输入框），仅 type=intake 时显示
- [x] 2.2 新增 water（水分）输入字段
- [x] 2.3 编辑模式下，当 `editingEntry.externalId` 存在时，nutrition 和 water 字段设为只读
- [x] 2.4 编辑模式下，当 `editingEntry.externalId` 存在时，以只读方式展示 minerals 信息（仅显示有值的矿物质）
- [x] 2.5 编辑模式下，当 `editingEntry.externalId` 不存在时，不显示 minerals 区域

## 3. 数据提交对齐

- [x] 3.1 CreateRecordDialog 提交时将 nutrition 和 water 字段包含在 DTO 中（未填写的子字段不传）
- [x] 3.2 编辑模式下回填已有的 nutrition、water 数据到表单

## 4. 矿物质中文标签映射

- [x] 4.1 在 `types/calorie.ts` 或 `utils/` 中新增矿物质字段到中文名+单位的映射表
