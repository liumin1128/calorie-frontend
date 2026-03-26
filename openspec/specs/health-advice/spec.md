## ADDED Requirements

### Requirement: 服务层封装 AI 健康建议接口

系统 SHALL 在 `services/adviceService.ts` 中封装 `POST /gateway/ai/suggest` 的调用，组件不得直接调用 `fetch` 或 `request()`。

#### Scenario: 调用健康建议接口
- **WHEN** 调用 `adviceService.getSuggestion(token)`
- **THEN** 系统向 `POST /gateway/ai/suggest` 发送固定 question，携带 JWT，返回 `{ suggestion: string, model: string }`

#### Scenario: 接口请求失败时抛出错误
- **WHEN** 接口返回错误或网络超时
- **THEN** `getSuggestion` 抛出 Error，调用方可捕获并展示错误信息

### Requirement: 主页展示 AI 健康建议卡片

系统 SHALL 在主页提供一个独立的「AI 健康建议」卡片区域，包含触发按钮和建议结果展示。

#### Scenario: 初始状态显示空卡片和按钮
- **WHEN** 用户进入主页，尚未触发建议
- **THEN** 页面显示「AI 健康建议」卡片，内含「获取健康建议」按钮，无建议内容

#### Scenario: 点击按钮触发 AI 请求
- **WHEN** 用户点击「获取健康建议」按钮
- **THEN** 按钮进入禁用状态并展示加载指示器，同时发起 `getSuggestion` 请求

#### Scenario: 成功获取建议后展示内容
- **WHEN** AI 接口成功返回 suggestion
- **THEN** 卡片展示 suggestion 文本（保留换行格式），按钮恢复可点击状态，标签改为「重新获取」

#### Scenario: 请求失败时展示错误提示
- **WHEN** AI 接口请求失败
- **THEN** 卡片展示错误提示，按钮恢复可点击状态

### Requirement: 手动触发、不自动执行

系统 SHALL NOT 在页面加载、日期切换或数据刷新时自动调用 AI 建议接口。

#### Scenario: 页面加载不自动触发
- **WHEN** 用户进入主页或切换查看日期
- **THEN** 系统不发起任何 AI 建议请求，仅等待用户手动点击

#### Scenario: 加载中禁止重复请求
- **WHEN** AI 请求正在进行中
- **THEN** 「获取健康建议」按钮处于禁用状态，无法触发新请求
