## ADDED Requirements

### Requirement: healthAdviceStore 管理健康建议并持久化到 sessionStorage

系统 SHALL 提供 `src/stores/healthAdviceStore.ts` Zustand Store，包含 advice、loading、error 状态及 fetchAdvice action，Store 初始化时从 sessionStorage 读取缓存，写入时同步持久化。

#### Scenario: Store 初始化时从 sessionStorage 恢复缓存

- **WHEN** 组件首次访问 healthAdviceStore
- **THEN** Store 从 sessionStorage 读取已有建议数据，若存在则直接设置到 advice 字段

#### Scenario: fetchAdvice 命中缓存时不发起请求

- **WHEN** 调用 fetchAdvice(token) 且 advice 已有数据（来自缓存或上次请求）
- **THEN** Store 不发起网络请求，直接返回，loading 保持 false

#### Scenario: fetchAdvice 无缓存时请求并持久化

- **WHEN** 调用 fetchAdvice(token) 且 advice 为 null
- **THEN** Store 设 loading 为 true，请求 AI 建议接口，成功后更新 advice 并写入 sessionStorage，loading 恢复 false

#### Scenario: fetchAdvice 强制刷新时忽略缓存

- **WHEN** 调用 fetchAdvice(token, { force: true })
- **THEN** Store 忽略现有缓存，发起新请求，成功后更新 advice 并覆盖 sessionStorage

#### Scenario: 请求失败时保留旧缓存数据

- **WHEN** 调用 fetchAdvice(token) 且请求失败
- **THEN** Store 的 advice 保持原有值不变，error 字段包含错误信息，loading 恢复 false

#### Scenario: clearAdvice 清除建议数据和缓存

- **WHEN** 调用 clearAdvice()
- **THEN** Store 的 advice 重置为 null，sessionStorage 中的缓存数据同时清除
