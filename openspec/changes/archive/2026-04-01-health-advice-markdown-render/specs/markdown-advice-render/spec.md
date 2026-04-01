## ADDED Requirements

### Requirement: AI 建议内容以 markdown 格式渲染

系统 SHALL 使用 `react-markdown` 组件将 AI 健康建议的 `suggestion` 文本以 markdown 富文本格式渲染，支持标题、段落、列表、加粗、斜体、代码块等常见 markdown 语法。

#### Scenario: 包含标题和列表的建议正确渲染
- **WHEN** AI 返回的 suggestion 包含 markdown 标题（`##`）和列表（`- item`）
- **THEN** 系统将标题渲染为对应层级的文本样式，列表渲染为有序/无序列表元素

#### Scenario: 包含加粗和斜体的建议正确渲染
- **WHEN** AI 返回的 suggestion 包含 `**加粗**` 或 `*斜体*` 标记
- **THEN** 系统将其渲染为对应的加粗或斜体文本

#### Scenario: 纯文本建议正常展示
- **WHEN** AI 返回的 suggestion 不包含任何 markdown 格式标记
- **THEN** 系统将其作为普通段落文本渲染，不出现异常

### Requirement: markdown 渲染样式与 MUI 主题一致

系统 SHALL 将 markdown 元素映射为 MUI Typography 组件变体，确保字体、颜色、间距与应用主题保持一致。

#### Scenario: markdown 标题使用 MUI Typography 变体
- **WHEN** markdown 内容包含 h1-h6 标题
- **THEN** 系统使用 MUI Typography 对应变体（h5、h6、subtitle1 等）渲染，样式与应用其他部分一致

#### Scenario: markdown 段落使用主题文本颜色
- **WHEN** markdown 内容包含段落文字
- **THEN** 系统使用 `text.secondary` 颜色渲染段落，与当前设计风格一致

### Requirement: 禁止渲染原始 HTML

系统 SHALL 禁止在 markdown 渲染中解析和执行原始 HTML 标签，防止 XSS 攻击。

#### Scenario: suggestion 包含 HTML 标签
- **WHEN** AI 返回的 suggestion 包含 `<script>` 或其他 HTML 标签
- **THEN** 系统不渲染这些 HTML 标签，将其作为纯文本显示或忽略
