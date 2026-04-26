## MODIFIED Requirements

### Requirement: 创建卡路里记录
用户 SHALL 能够通过弹窗表单创建新的卡路里记录，数据提交到后端 API。弹窗支持通过图片上传 + AI 分析辅助填写，并在存在来源图片时将图片 URL 一并保存到记录中。

#### Scenario: 成功创建记录
- **WHEN** 用户填写表单并点击提交
- **THEN** SHALL 调用后端 API 创建记录，成功后刷新列表并关闭弹窗

#### Scenario: 创建失败显示错误
- **WHEN** API 返回错误
- **THEN** SHALL 在弹窗中显示错误提示，不关闭弹窗

#### Scenario: 通过图片分析辅助创建记录
- **WHEN** 用户上传食物图片并完成 AI 分析
- **THEN** SHALL 自动填充表单字段，用户确认后可直接提交

#### Scenario: 创建饮食记录时保存来源图片
- **WHEN** 用户提交的饮食记录附带来源图片
- **THEN** 系统 SHALL 在创建记录前完成图片上传
- **THEN** 系统 SHALL 将返回的图片 URL 作为 `images` 字段一并提交

### Requirement: 编辑卡路里记录
用户 SHALL 能够编辑已有的卡路里记录，并在存在图片时查看、保留、替换或移除记录图片。

#### Scenario: 打开编辑弹窗
- **WHEN** 用户点击记录的编辑按钮
- **THEN** SHALL 打开弹窗，表单中预填当前记录数据

#### Scenario: 成功更新记录
- **WHEN** 用户修改字段并点击提交
- **THEN** SHALL 调用后端 API 更新记录，成功后刷新列表并关闭弹窗

#### Scenario: 编辑时回显并更新图片
- **WHEN** 被编辑记录已包含 `images`
- **THEN** 弹窗 SHALL 回显已保存图片
- **THEN** 若用户替换或移除图片，更新请求 SHALL 发送新的 `images` 数组

### Requirement: 记录弹窗字段适配后端
记录弹窗（创建/编辑）的表单字段 SHALL 对齐后端 API 的字段定义，饮食类型时额外提供图片上传入口，并支持记录级图片回显。

#### Scenario: 表单包含必需字段
- **WHEN** 打开创建/编辑弹窗
- **THEN** 表单 SHALL 包含：类型选择（摄入/消耗）、标题、卡路里数值、日期时间

#### Scenario: 饮食类型包含图片上传
- **WHEN** 打开创建弹窗且类型为「饮食」
- **THEN** 表单 SHALL 额外包含图片上传区域和「分析」按钮

#### Scenario: 类型映射
- **WHEN** 用户选择「饮食」
- **THEN** SHALL 映射为后端类型 `"intake"`
- **WHEN** 用户选择「运动」
- **THEN** SHALL 映射为后端类型 `"burn"`

#### Scenario: 编辑时回显图片字段
- **WHEN** 打开包含 `images` 的饮食记录编辑弹窗
- **THEN** 图片上传区域 SHALL 显示当前已保存图片

### Requirement: 编辑记录传递完整数据
首页编辑入口 SHALL 将完整的 CalorieEntry 对象传递给 CreateRecordDialog，包含 nutrition、minerals、water、externalId 和 images 字段。

#### Scenario: 点击编辑已有记录
- **WHEN** 用户点击列表中某条记录的编辑按钮
- **THEN** CreateRecordDialog 接收完整的 CalorieEntry 数据
- **THEN** 弹窗根据 externalId 判断来源并展示对应的编辑界面

#### Scenario: 列表展示图片缩略图
- **WHEN** 查询返回包含 `images` 字段的记录
- **THEN** 列表 SHALL 为存在图片的记录展示缩略图
- **THEN** 其他字段展示样式保持可读且不破坏当前列表结构