## ADDED Requirements

### Requirement: useCalorieTracker 管理最近新增饮食记录点评状态
`useCalorieTracker` SHALL 在新增饮食记录成功后为该条记录加载 AI 点评，并维护点评展示所需的本地状态。

#### Scenario: 新增饮食记录后加载点评
- **WHEN** 用户在非编辑模式下成功新增一条 `type = "intake"` 的记录
- **THEN** Hook SHALL 基于创建结果中的 `_id` 请求该条记录的点评
- **THEN** Hook SHALL 更新最近一次饮食点评内容和对应加载状态

#### Scenario: 新增运动或编辑记录时不加载点评
- **WHEN** 用户新增一条 `type = "burn"` 的记录，或编辑任意已有记录
- **THEN** Hook SHALL 不调用单条记录点评接口

#### Scenario: 点评失败不影响新增主流程
- **WHEN** 饮食记录已成功创建，但点评请求失败
- **THEN** Hook SHALL 保持新增成功结果，不得将错误向上抛回为记录创建失败

#### Scenario: 切换日期时清空最近点评
- **WHEN** 用户切换 `selectedDate`
- **THEN** Hook SHALL 清空当前页面保存的最近一次饮食点评内容和加载状态

### Requirement: 饮食记录卡片展示最近新增记录点评
`CalorieRecordList` SHALL 在饮食记录卡片中提供一个内联 Alert 区域，用于展示最近一次新增饮食记录的点评反馈。

#### Scenario: 点评加载中显示提示
- **WHEN** 最近一次饮食点评正在请求中
- **THEN** 饮食记录卡片 SHALL 显示信息态 Alert，提示用户点评正在生成

#### Scenario: 点评成功后显示文本
- **WHEN** 最近一次饮食点评请求成功并返回 comment
- **THEN** 饮食记录卡片 SHALL 在 Alert 区域展示该点评文本

#### Scenario: 没有点评内容时不渲染区域
- **WHEN** 当前页面不存在最近一次饮食点评且未处于加载中
- **THEN** 饮食记录卡片 SHALL 不渲染点评 Alert 区域

#### Scenario: 运动记录卡片不显示点评区域
- **WHEN** 页面渲染运动记录卡片
- **THEN** 运动记录卡片 SHALL 保持当前结构，不新增点评 Alert 区域