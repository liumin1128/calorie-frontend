## ADDED Requirements

### Requirement: 首页加载真实数据
首页 SHALL 在组件挂载时通过 `calorieService` 从后端 API 加载当天的卡路里记录，替代硬编码模拟数据。

#### Scenario: 页面加载时获取当天记录
- **WHEN** 用户访问首页
- **THEN** SHALL 调用 API 获取当天的卡路里记录并展示在界面上

#### Scenario: 加载中显示加载状态
- **WHEN** API 请求正在进行中
- **THEN** SHALL 显示加载指示器（如 Skeleton 或 Loading 提示）

#### Scenario: 加载失败显示错误提示
- **WHEN** API 请求失败
- **THEN** SHALL 显示错误提示信息，并提供重试操作

### Requirement: 创建卡路里记录
用户 SHALL 能够通过弹窗表单创建新的卡路里记录，数据提交到后端 API。

#### Scenario: 成功创建记录
- **WHEN** 用户填写表单并点击提交
- **THEN** SHALL 调用后端 API 创建记录，成功后刷新列表并关闭弹窗

#### Scenario: 创建失败显示错误
- **WHEN** API 返回错误
- **THEN** SHALL 在弹窗中显示错误提示，不关闭弹窗

### Requirement: 编辑卡路里记录
用户 SHALL 能够编辑已有的卡路里记录。

#### Scenario: 打开编辑弹窗
- **WHEN** 用户点击记录的编辑按钮
- **THEN** SHALL 打开弹窗，表单中预填当前记录数据

#### Scenario: 成功更新记录
- **WHEN** 用户修改字段并点击提交
- **THEN** SHALL 调用后端 API 更新记录，成功后刷新列表并关闭弹窗

### Requirement: 删除卡路里记录
用户 SHALL 能够删除已有的卡路里记录。

#### Scenario: 确认删除
- **WHEN** 用户点击删除按钮
- **THEN** SHALL 调用后端 API 删除记录，成功后从列表中移除该记录

### Requirement: 按日期筛选记录
用户 SHALL 能够选择日期查看该日的卡路里记录。

#### Scenario: 切换日期
- **WHEN** 用户选择不同的日期
- **THEN** SHALL 重新调用 API 获取该日的记录并更新界面

#### Scenario: 默认显示今天
- **WHEN** 用户首次访问首页
- **THEN** SHALL 默认显示今天的日期和记录

### Requirement: 记录弹窗字段适配后端
记录弹窗（创建/编辑）的表单字段 SHALL 对齐后端 API 的字段定义。

#### Scenario: 表单包含必需字段
- **WHEN** 打开创建/编辑弹窗
- **THEN** 表单 SHALL 包含：类型选择（摄入/消耗）、标题、卡路里数值、日期时间

#### Scenario: 类型映射
- **WHEN** 用户选择「饮食」
- **THEN** SHALL 映射为后端类型 `"intake"`
- **WHEN** 用户选择「运动」
- **THEN** SHALL 映射为后端类型 `"burn"`
