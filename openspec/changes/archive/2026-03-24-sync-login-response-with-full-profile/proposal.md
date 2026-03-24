## Why

后端 `add-user-profile` 变更后，`POST /auth/login` 和 `POST /auth/register` 响应中的 `user` 字段已扩展为完整用户画像（包含 `gender`、`birthday`、`signature`、`latestHeight`、`latestWeight`），与 `GET /user/full-profile` 返回结构一致。前端 `AuthResponse` 类型定义仍停留在旧版（仅含 `id`、`email`、`nickname`），导致类型不准确，且登录成功后 `UserProfileContext` 会额外发起一次 `GET /user/full-profile` 请求，而这些数据在登录响应中已经存在，造成冗余请求。

## What Changes

- 更新 `src/lib/api.ts` 中的 `AuthResponse` 接口，将 `user` 字段类型对齐为 `UserFullProfile`
- 更新 `src/contexts/AuthContext.tsx`，登录/注册成功后将响应中的完整用户画像数据传递给 `UserProfileContext`
- 更新 `src/contexts/UserProfileContext.tsx`，新增从外部注入初始 `profile` 数据的能力，使登录时可直接使用登录响应数据填充 `profile`，避免额外 API 请求

## Capabilities

### New Capabilities

（无新增能力，属于已有 `user-profile` 能力的对接优化）

### Modified Capabilities

- `user-profile`: 优化用户信息加载路径——登录/注册时直接从响应数据初始化 `profile`，而非在登录后额外请求 `GET /user/full-profile`；类型对齐确保登录响应与 `UserFullProfile` 一致

## Impact

- **修改文件**：`src/lib/api.ts`、`src/contexts/AuthContext.tsx`、`src/contexts/UserProfileContext.tsx`
- **API 变更**：无接口变更，仅客户端行为优化（减少一次 `GET /user/full-profile` 请求）
- **类型变更**：`AuthResponse.user` 类型从 `{ id, email, nickname }` 升级为 `UserFullProfile`
- **向后兼容**：后端已支持，前端仅做类型修正和初始化路径优化，无破坏性变更
