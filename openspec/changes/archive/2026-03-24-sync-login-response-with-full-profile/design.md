## Context

后端 `add-user-profile` 变更后，`/auth/login` 和 `/auth/register` 响应中的 `user` 对象已扩展为完整用户画像（含 `gender`、`birthday`、`signature`、`latestHeight`、`latestWeight`）。前端现有实现中，`AuthResponse.user` 类型仅定义了 `{ id, email, nickname }`，导致：
1. 类型与实际响应不匹配（TypeScript 类型不准确）
2. 登录后 `UserProfileContext` 发起额外的 `GET /user/full-profile` 请求来获取已包含在登录响应中的数据

当前数据流：`POST /auth/login` → 存储 `{ id, email, nickname }` → `UserProfileContext` 再调用 `GET /user/full-profile` → 更新 `profile`

## Goals / Non-Goals

**Goals:**
- 修正 `AuthResponse.user` 类型，与后端实际响应对齐（使用 `UserFullProfile`）
- 登录/注册后利用响应中的完整用户画像直接初始化 `UserProfileContext`，消除冗余的 `GET /user/full-profile` 请求
- 保持 `refreshProfile()` 功能可用，支持手动/保存后主动刷新

**Non-Goals:**
- 不修改 `AuthContext.User` 接口定义（仅保存认证必需的最小字段）
- 不引入新的状态管理库
- 不修改后端 API

## Decisions

### Decision 1: `AuthResponse.user` 类型对齐 `UserFullProfile`

**选择**: 将 `src/lib/api.ts` 中 `AuthResponse.user` 类型改为 `UserFullProfile`（从 `src/types/user` 导入）。

**理由**: 后端登录/注册响应的 `user` 字段结构与 `UserFullProfile` 完全一致，复用已有类型可消除重复定义，并让 TypeScript 类型系统与实际运行时数据一致。

**备选方案**: 在 `api.ts` 中内联扩展接口 —— 会产生重复定义，与 `types/user.ts` 不同步，放弃。

### Decision 2: 通过回调注入初始 profile 而非 UserProfileContext 订阅 AuthContext

**选择**: 在 `AuthContext` 的 `login` / `register` 方法成功后，直接调用 `UserProfileContext` 提供的 `setProfileFromAuth(profile)` 方法，将登录响应中的完整 profile 注入到 `UserProfileContext`。

**理由**:
- 避免 `UserProfileContext` 订阅 `AuthContext` 的状态变化产生循环依赖（`AuthContext` 已不依赖 `UserProfileContext`，反向依赖会产生复杂耦合）
- 调用时机精确：只有在登录/注册成功时才触发一次性初始化，而不是每次 user/token 变化都触发重新请求
- 接口清晰：`setProfileFromAuth` 是 `UserProfileContext` 暴露的显式方法，语义明确

**备选方案 A**: `UserProfileContext` 监听 `token` 变化后请求 `GET /user/full-profile` —— 当前实现，产生冗余请求，放弃优化。

**备选方案 B**: 将完整 profile 存入 `AuthContext` —— `AuthContext` 应只关注认证状态，不应承载业务数据，违反单一职责，放弃。

### Decision 3: `UserProfileContext` 新增 `setProfileFromAuth` 方法

**选择**: 在 `UserProfileContextType` 接口中新增 `setProfileFromAuth(profile: UserFullProfile) => void` 方法，供 `AuthContext` 在登录/注册成功后调用。

**理由**: 提供一个显式的初始化入口，逻辑清晰，且不需要修改 `UserProfileContext` 内部的异步加载逻辑（`refreshProfile` 不受影响）。

## Risks / Trade-offs

- **[Context 依赖顺序]** `AuthContext` 需能访问 `UserProfileContext` → 要求 `UserProfileProvider` 与 `AuthProvider` 的嵌套保持当前顺序（`AuthProvider` 为内层），在 `layout.tsx` 中已满足
- **[登出后 profile 清理]** 登出时需确保 `profile` 被清空 → `UserProfileContext` 已在监听 `user === null` 时重置 `profile`，无需额外处理
