## Context

后端 `POST /gateway/ai/suggest` 接口已就绪：需要 JWT 认证，body 为 `{ question: string }`（最大 500 字符），后端自动拉取用户档案+近7天卡路里记录拼装上下文，返回 `{ suggestion: string, model: string }`。前端目前无任何 AI 建议入口。

## Goals / Non-Goals

**Goals:**
- 在主页新增「获取健康建议」卡片区域，含触发按钮和结果展示
- 封装服务层 `adviceService.ts`，组件不直接调用 `fetch`
- 支持加载中、成功、错误三种状态展示
- 仅手动点击触发，不自动执行

**Non-Goals:**
- 不支持用户自定义 `question`（默认使用固定问题，后端上下文已足够）
- 不做历史建议缓存或持久化
- 不引入 Markdown 渲染库（使用 `<pre>` 或 `Typography` 换行展示即可）
- 不改动后端

## Decisions

### 1. 固定 question 字符串

后端已自动整合完整用户上下文，前端不需要让用户输入问题。使用固定 question，如「请根据我的个人数据给出健康建议」，简化 UI 复杂度。

### 2. 建议展示使用 Typography + whiteSpace: pre-wrap

后端返回的 suggestion 包含换行符和 Markdown 结构，不引入新渲染库，直接用 `sx={{ whiteSpace: 'pre-wrap' }}` 保留格式，满足需求。

- 备选：引入 `react-markdown` — 会增加依赖，不符合简洁原则。

### 3. 状态管理在 page.tsx 内联（useState）

建议功能是独立的一次性 UI 块，不需要 Context 或全局状态。直接在 `page.tsx` 用 `useState` 管理 `advice / loading / error` 三个状态。

### 4. 按钮点击后不阻止重复请求（允许重新获取）

用户可以主动点击「重新获取」刷新建议；加载中时禁用按钮，防止并发请求。

## Risks / Trade-offs

- [风险] AI 接口响应慢（30秒超时）→ 加载状态+按钮禁用，避免用户重复点击
- [风险] `page.tsx` 行数继续增加 → 建议提取为 `HealthAdviceCard` 组件，保持文件职责单一
