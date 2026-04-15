## ADDED Requirements

### Requirement: 编辑弹窗按来源差异化展示营养信息
编辑弹窗（CreateRecordDialog）SHALL 根据记录来源展示不同的编辑控件：
- 手动添加 / AI 识别记录：显示可编辑的 nutrition（蛋白质、碳水、脂肪、纤维）和 water 字段
- 条码扫描记录（externalId 存在）：以只读方式展示 nutrition、water 和 minerals 信息

#### Scenario: 编辑手动添加的记录
- **WHEN** 用户编辑一条无 externalId 的记录
- **THEN** 弹窗显示基本信息（标题、卡路里、日期时间）可编辑
- **THEN** 弹窗显示 nutrition 区域（蛋白质、碳水、脂肪、纤维）和 water 字段可编辑
- **THEN** 弹窗不显示 minerals 区域

#### Scenario: 编辑 AI 识别的记录
- **WHEN** 用户编辑一条无 externalId 且有 nutrition 数据的记录
- **THEN** 弹窗显示与手动添加相同的编辑界面，nutrition 和 water 字段pre-filled 且可编辑

#### Scenario: 编辑条码扫描的记录
- **WHEN** 用户编辑一条有 externalId 的记录
- **THEN** 弹窗显示基本信息（标题、卡路里、日期时间）可编辑
- **THEN** 弹窗以只读方式展示 nutrition（蛋白质、碳水、脂肪、纤维）和 water 数据
- **THEN** 弹窗以只读方式展示 minerals 数据（仅展示有值的矿物质）
- **THEN** 所有营养和矿物质字段不可修改

### Requirement: 新建记录支持营养信息输入
新建记录时（非编辑模式），CreateRecordDialog SHALL 提供 nutrition 和 water 的可选输入字段。

#### Scenario: 新建记录填写营养信息
- **WHEN** 用户新建一条摄入记录
- **THEN** 弹窗显示可选的 nutrition（蛋白质、碳水、脂肪、纤维）和 water 输入字段
- **THEN** 用户可以选择性填写或全部留空

#### Scenario: 新建运动记录不显示营养信息
- **WHEN** 用户新建一条运动（burn）记录
- **THEN** 弹窗不显示 nutrition、water 和 minerals 区域

### Requirement: 营养信息保存时传递完整数据
CreateRecordDialog 提交时 SHALL 将 nutrition 和 water 字段包含在 CreateCalorieEntryDto 或 UpdateCalorieEntryDto 中。

#### Scenario: 保存包含营养信息的记录
- **WHEN** 用户填写了 nutrition 字段并点击保存
- **THEN** 提交的 DTO SHALL 包含 nutrition 对象（protein、carbohydrates、fat、fiber）和 water 值
- **THEN** 未填写的 nutrition 子字段不发送（不传 0）
