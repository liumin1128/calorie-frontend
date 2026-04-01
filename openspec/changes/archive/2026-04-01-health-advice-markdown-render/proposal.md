## Why

AI 健康建议接口返回的文本通常包含标题、列表、加粗等 markdown 格式内容，但当前 `HealthAdviceCard` 仅以纯文本 (`pre-wrap`) 展示，排版效果差、可读性低。需要将 AI 建议以 markdown 富文本形式渲染，提升用户阅读体验。

## What Changes

- 引入 `react-markdown` 组件，将 AI 建议文本以 markdown 格式渲染
- 修改 `HealthAdviceCard` 组件，将纯文本 `<Typography>` 替换为 markdown 渲染组件
- 为 markdown 内容添加与 MUI 主题一致的排版样式

## Capabilities

### New Capabilities

- `markdown-advice-render`: 在健康建议卡片中将 AI 返回的 suggestion 文本以 markdown 格式渲染，支持标题、列表、加粗、代码块等常见 markdown 语法

### Modified Capabilities

- `health-advice-page`: 建议内容的展示方式由纯文本变更为 markdown 富文本渲染

## Impact

- **依赖**: 新增 `react-markdown` npm 依赖
- **组件**: `HealthAdviceCard.tsx` 需修改渲染逻辑
- **样式**: 需为 markdown 输出元素添加与 MUI 主题协调的样式
- **API**: 无变更，后端返回的 `suggestion` 字段本身已包含 markdown 格式文本
