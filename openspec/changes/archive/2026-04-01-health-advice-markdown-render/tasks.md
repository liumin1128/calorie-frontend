## 1. 依赖安装

- [x] 1.1 安装 `react-markdown` 依赖：`pnpm add react-markdown`

## 2. 组件修改

- [x] 2.1 在 `HealthAdviceCard.tsx` 中引入 `react-markdown`，将纯文本 `<Typography>` 替换为 `<ReactMarkdown>` 渲染
- [x] 2.2 配置 `components` prop，将 markdown 元素映射为 MUI Typography 组件变体（h1→h5, h2→h6, p→body2 等），使用 `sx` 设置间距和颜色
- [x] 2.3 确保不启用 `rehype-raw` 插件，保持默认 HTML 过滤行为，防止 XSS

## 3. 验证

- [x] 3.1 本地启动应用，获取 AI 健康建议，验证 markdown 格式（标题、列表、加粗）正确渲染
- [x] 3.2 验证纯文本建议内容正常展示，无异常
