## Context

当前 `HealthAdviceCard` 组件使用 `<Typography whiteSpace="pre-wrap">` 渲染 AI 建议文本。后端 AI 接口返回的 `suggestion` 字段内容通常包含 markdown 格式（标题、列表、加粗等），但以纯文本展示时格式标记直接暴露，阅读体验差。

## Goals / Non-Goals

**Goals:**
- 将 AI 建议内容以 markdown 富文本渲染，正确展示标题、列表、加粗、代码块等常见元素
- markdown 渲染样式与 MUI 主题保持一致（字体、颜色、间距）
- 改动范围最小化，仅修改展示层

**Non-Goals:**
- 不支持 HTML 内嵌（安全考虑，禁用 raw HTML 渲染）
- 不支持数学公式、图表等高级 markdown 扩展
- 不修改后端 API 返回格式

## Decisions

### 1. 使用 `react-markdown` 作为 markdown 渲染组件

**选择**: `react-markdown`
**理由**:
- React 生态中最流行的 markdown 渲染库，周下载量 300万+
- 基于 remark/rehype 生态，可扩展性强
- 默认不渲染 raw HTML（安全），符合 XSS 防护需求
- 支持自定义组件映射，可映射为 MUI 的 Typography 等组件

**备选方案**:
- `marked` + `dangerouslySetInnerHTML`: 性能好但存在 XSS 风险，需额外引入 DOMPurify
- `@uiw/react-markdown-preview`: 功能过重，包含代码高亮等不需要的依赖

### 2. 通过 `components` prop 映射 MUI 组件

将 markdown 元素（h1-h6、p、li 等）映射为 MUI `Typography` 组件变体，确保与主题样式一致。使用 `sx` prop 内联样式微调间距。

### 3. 安全策略

`react-markdown` 默认不解析 raw HTML，即后端返回的内容即使包含 `<script>` 等标签也不会被执行。保持此默认行为，不额外配置 `rehype-raw` 插件。

## Risks / Trade-offs

- **[包体积增加]** → `react-markdown` 约 30KB gzip，对整体影响较小且仅在健康建议页使用，可通过 Next.js 动态导入按需加载
- **[样式不一致风险]** → 通过 MUI 组件映射和 sx 样式确保一致性，需要人工验证常见 markdown 元素的渲染效果
- **[后端返回非 markdown 内容]** → `react-markdown` 对纯文本也能正常渲染为段落，无降级风险
