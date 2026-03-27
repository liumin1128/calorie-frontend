## ADDED Requirements

### Requirement: 服务层封装 AI 健康建议接口

系统 SHALL 在 `services/adviceService.ts` 中封装 `POST /gateway/ai/suggest` 的调用，组件不得直接调用 `fetch` 或 `request()`。

#### Scenario: 调用健康建议接口
- **WHEN** 调用 `adviceService.getSuggestion(token)`
- **THEN** 系统向 `POST /gateway/ai/suggest` 发送固定 question，携带 JWT，返回 `{ suggestion: string, model: string }`

#### Scenario: 接口请求失败时抛出错误
- **WHEN** 接口返回错误或网络超时
- **THEN** `getSuggestion` 抛出 Error，调用方可捕获并展示错误信息
