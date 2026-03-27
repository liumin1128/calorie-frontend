## MODIFIED Requirements

### Requirement: 健康建议支持会话级缓存

系统 SHALL 在 `HealthAdviceCard` 组件中通过 `healthAdviceStore` 获取建议数据；若会话内已有缓存，则直接展示缓存数据而不发起新请求；用户可通过「重新获取」按钮强制刷新。

#### Scenario: 首次进入页面请求建议

- **WHEN** 用户首次进入健康建议页且 sessionStorage 中无缓存
- **THEN** 组件触发 fetchAdvice，显示加载状态，成功后展示建议内容

#### Scenario: 会话内再次进入页面使用缓存

- **WHEN** 用户在同一会话内再次访问健康建议页
- **THEN** 组件直接展示 healthAdviceStore 中的缓存数据，不发起新请求，无加载状态

#### Scenario: 用户主动刷新建议

- **WHEN** 用户点击「重新获取」按钮
- **THEN** 调用 fetchAdvice(token, { force: true })，忽略缓存重新请求，成功后更新展示内容并覆盖缓存

#### Scenario: 网络请求失败时展示错误信息

- **WHEN** fetchAdvice 请求失败
- **THEN** 展示错误提示和「重试」按钮，原有缓存数据（若有）仍可见
