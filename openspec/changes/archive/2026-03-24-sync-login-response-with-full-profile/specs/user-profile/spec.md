## MODIFIED Requirements

### Requirement: 登录时自动获取用户完整信息

系统 SHALL 在用户登录成功后，直接利用登录响应中返回的完整用户画像初始化 UserProfileContext，无需额外发起 `GET /user/full-profile` 请求。

#### Scenario: 登录后从登录响应初始化用户信息
- **WHEN** 用户登录成功，服务端返回含 `user`（含 `gender`、`birthday`、`signature`、`latestHeight`、`latestWeight`）的完整响应
- **THEN** 系统将响应中的完整 `user` 数据注入 UserProfileContext，立即可供组件消费，无需等待额外 API 请求

#### Scenario: 注册后从注册响应初始化用户信息
- **WHEN** 用户注册成功，服务端返回含完整 `user` 的响应
- **THEN** 系统同样将响应数据注入 UserProfileContext，行为与登录一致

#### Scenario: 获取用户信息失败时降级处理
- **WHEN** 用户已登录但 profile 初始化数据不完整（异常场景）
- **THEN** 系统保留已有的认证状态，UserProfileContext 中 profile 为 null，不阻断页面正常使用

## ADDED Requirements

### Requirement: AuthResponse 类型对齐后端实际响应

系统 SHALL 使用与 `UserFullProfile` 一致的类型来描述登录/注册响应中的 `user` 字段，确保 TypeScript 类型系统与运行时数据结构一致。

#### Scenario: 登录响应类型包含完整用户画像字段
- **WHEN** TypeScript 代码引用 `AuthResponse.user`
- **THEN** 类型系统应可访问 `gender`、`birthday`、`signature`、`latestHeight`、`latestWeight` 等字段，无需断言

### Requirement: 手动刷新用户信息（保持不变）

系统 SHALL 继续提供 `refreshProfile()` 方法，允许组件在需要时（如保存后）主动请求 `GET /user/full-profile` 获取最新数据。

#### Scenario: 手动触发刷新
- **WHEN** 组件调用 `refreshProfile()` 方法
- **THEN** 系统重新请求 `GET /user/full-profile`，更新 UserProfileContext 中的 profile 数据

#### Scenario: 编辑保存后自动刷新
- **WHEN** 用户在 ProfileDialog 中保存修改成功
- **THEN** 系统自动调用 `refreshProfile()` 以确保展示最新数据
