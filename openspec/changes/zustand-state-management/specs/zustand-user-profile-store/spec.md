## ADDED Requirements

### Requirement: userProfileStore 管理用户档案全局状态

系统 SHALL 提供 `src/stores/userProfileStore.ts` Zustand Store，包含 profile、loading 状态及 fetchProfile action，供 UserProfileContext 内部使用。

#### Scenario: Store 初始包含空档案状态

- **WHEN** 应用首次加载
- **THEN** Store 的 profile 为 null，loading 为 false

#### Scenario: fetchProfile action 从服务器加载档案

- **WHEN** 调用 fetchProfile(token)
- **THEN** Store 将 loading 设为 true，请求完成后更新 profile，loading 恢复 false

#### Scenario: fetchProfile 失败时 profile 保持不变

- **WHEN** 调用 fetchProfile(token) 且请求失败
- **THEN** Store 的 profile 不变，loading 恢复 false

#### Scenario: clearProfile action 清除档案数据

- **WHEN** 调用 clearProfile()
- **THEN** Store 的 profile 重置为 null，用于登出场景

#### Scenario: Store 数据跨组件共享

- **WHEN** 多个组件同时访问 userProfileStore
- **THEN** 所有组件读取相同的 profile 数据，无需重复请求
