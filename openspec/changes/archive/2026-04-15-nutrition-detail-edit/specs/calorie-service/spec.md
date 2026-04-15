## MODIFIED Requirements

### Requirement: 类型定义对齐后端完整数据模型
CalorieEntry 和 CreateCalorieEntryDto 类型 SHALL 包含 source 和 externalId 字段，与后端 schema 对齐。

#### Scenario: CalorieEntry 包含完整字段
- **WHEN** 后端返回卡路里记录数据
- **THEN** 前端 CalorieEntry 类型 SHALL 包含 source（EntrySource）和 externalId（string）可选字段
- **THEN** 前端 CalorieEntry 类型 SHALL 包含 water、nutrition（NutritionInfo）和 minerals（MineralsInfo）可选字段

#### Scenario: CreateCalorieEntryDto 支持提交完整数据
- **WHEN** 前端创建或更新记录
- **THEN** CreateCalorieEntryDto SHALL 包含可选的 source 和 externalId 字段
- **THEN** UpdateCalorieEntryDto 自动继承新增字段（Partial 类型）
