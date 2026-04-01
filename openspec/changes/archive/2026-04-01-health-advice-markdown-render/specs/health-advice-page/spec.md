## MODIFIED Requirements

### Requirement: 健康建议页面包含完整交互

系统 SHALL 在 `/health-advice` 页面内完整承载 AI 建议的触发、加载与展示交互。

#### Scenario: 页面初始状态

- **WHEN** 用户进入健康建议页面
- **THEN** 页面展示「AI 健康建议」卡片，含「获取健康建议」按钮，无建议内容

#### Scenario: 用户点击获取建议

- **WHEN** 用户点击「获取健康建议」按钮
- **THEN** 按钮禁用并显示加载中，发起 AI 建议请求

#### Scenario: 成功获取建议内容

- **WHEN** AI 接口成功返回 suggestion
- **THEN** 页面以 markdown 富文本格式展示建议内容，支持标题、列表、加粗等格式，按钮恢复并标签改为「重新获取」

#### Scenario: 请求失败展示错误信息

- **WHEN** AI 接口请求失败
- **THEN** 页面展示错误提示，按钮恢复可点击
