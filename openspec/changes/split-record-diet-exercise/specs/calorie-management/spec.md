## MODIFIED Requirements

### Requirement: 创建卡路里记录
用户 SHALL 能够通过弹窗表单创建新的卡路里记录，数据提交到后端 API。弹窗支持通过图片上传 + AI 分析辅助填写。弹窗 SHALL 支持 `lockedType` 模式，当从类型选择面板进入时，类型字段锁定，隐藏类型切换 ToggleButton。

#### Scenario: 成功创建记录
- **WHEN** 用户填写表单并点击提交
- **THEN** SHALL 调用后端 API 创建记录，成功后刷新列表并关闭弹窗

#### Scenario: 创建失败显示错误
- **WHEN** API 返回错误
- **THEN** SHALL 在弹窗中显示错误提示，不关闭弹窗

#### Scenario: 通过图片分析辅助创建记录
- **WHEN** 用户上传食物图片并完成 AI 分析
- **THEN** SHALL 自动填充表单字段，用户确认后可直接提交

#### Scenario: 类型锁定模式
- **WHEN** 弹窗以 lockedType 模式打开
- **THEN** SHALL 隐藏类型切换 ToggleButton，类型字段使用传入的锁定值
- **AND** 预设列表 SHALL 根据锁定类型自动切换（饮食预设或运动预设）

#### Scenario: 自动触发图片选择
- **WHEN** 弹窗以 autoTriggerImage 模式打开（从 AI 图片识别入口进入）
- **THEN** SHALL 在弹窗打开后自动触发文件选择器

### Requirement: 记录弹窗字段适配后端
记录弹窗（创建/编辑）的表单字段 SHALL 对齐后端 API 的字段定义，饮食类型时额外提供图片上传入口。

#### Scenario: 表单包含必需字段
- **WHEN** 打开创建/编辑弹窗
- **THEN** 表单 SHALL 包含：标题、卡路里数值、日期时间（类型锁定模式下无类型切换）

#### Scenario: 饮食类型包含图片上传
- **WHEN** 打开创建弹窗且类型为「饮食」（无论是手动选择还是锁定）
- **THEN** 表单 SHALL 额外包含图片上传区域和「分析」按钮

#### Scenario: 类型映射
- **WHEN** 用户选择「饮食」或类型锁定为饮食
- **THEN** SHALL 映射为后端类型 `"intake"`
- **WHEN** 用户选择「运动」或类型锁定为运动
- **THEN** SHALL 映射为后端类型 `"burn"`
