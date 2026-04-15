## MODIFIED Requirements

### Requirement: 编辑记录传递完整数据
首页编辑入口 SHALL 将完整的 CalorieEntry 对象传递给 CreateRecordDialog，包含 nutrition、minerals、water、externalId 字段。

#### Scenario: 点击编辑已有记录
- **WHEN** 用户点击列表中某条记录的编辑按钮
- **THEN** CreateRecordDialog 接收完整的 CalorieEntry 数据
- **THEN** 弹窗根据 externalId 判断来源并展示对应的编辑界面

#### Scenario: 列表展示不变
- **WHEN** 查询返回包含 nutrition/minerals/water 字段的记录
- **THEN** 列表 UI 保持当前展示样式不变，不新增字段展示
