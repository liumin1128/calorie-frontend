## ADDED Requirements

### Requirement: 记录列表分栏筛选
CalorieRecordList SHALL 提供 Tab 切换来按类型筛选记录，支持「全部」「饮食」「运动」三个标签页。

#### Scenario: 默认展示全部记录
- **WHEN** 用户访问首页或切换日期
- **THEN** 记录列表 SHALL 默认在「全部」标签页，展示当日所有记录

#### Scenario: 切换到饮食标签
- **WHEN** 用户点击「饮食」标签
- **THEN** 列表 SHALL 仅展示 type 为 "intake" 的记录

#### Scenario: 切换到运动标签
- **WHEN** 用户点击「运动」标签
- **THEN** 列表 SHALL 仅展示 type 为 "burn" 的记录

#### Scenario: 空状态展示
- **WHEN** 当前标签下没有对应类型的记录
- **THEN** SHALL 展示空状态提示（如「暂无饮食记录」或「暂无运动记录」）

### Requirement: 分栏统计信息
每个标签页 SHALL 展示对应类型的卡路里小计。

#### Scenario: 饮食标签统计
- **WHEN** 用户在「饮食」标签页
- **THEN** SHALL 展示当日饮食总摄入卡路里

#### Scenario: 运动标签统计
- **WHEN** 用户在「运动」标签页
- **THEN** SHALL 展示当日运动总消耗卡路里

#### Scenario: 全部标签统计
- **WHEN** 用户在「全部」标签页
- **THEN** SHALL 同时展示摄入和消耗总计
