## Context

当前应用使用 React 内置 `useState` + Context 管理全局数据：
- `AuthContext`：登录状态和 token
- `UserProfileContext`：用户档案，每次挂载都向服务器请求
- `useCalorieTracker` Hook：卡路里条目的本地 useState，每次切换日期重新请求
- `HealthAdviceCard`：每次进入页面都发起 AI 建议请求（耗时且消耗 AI 额度）

随着页面数量增加，状态孤岛问题愈发明显；健康建议无缓存，会话内每次访问重复调用 AI 接口。

## Goals / Non-Goals

**Goals:**
- 引入 Zustand 作为轻量全局状态层，三个业务域各建一个 Store
- `calorieStore`：卡路里条目列表与分页/日期状态
- `userProfileStore`：用户档案，跨组件共享，减少重复请求
- `healthAdviceStore`：健康建议 + sessionStorage 持久化（会话内不重复请求）
- 保持 `UseCalorieTrackerReturn` 接口和 `UserProfileContext` 接口不变（向后兼容）
- 认证状态保留在 `AuthContext`，不迁移

**Non-Goals:**
- 不引入 TanStack Query 或 SWR（避免过度依赖）
- 不做 localStorage 持久化（用户登出后数据应清除，sessionStorage 更安全）
- 不把认证 token 放入 Zustand（Cookie + localStorage 双存储已满足需求）
- 不做跨会话持久化（刷新后重新请求）

## Decisions

### Decision 1：选择 Zustand 而非 Redux/Jotai

**选择**：Zustand  
**理由**：
- 体积最小（~1KB gzip），无 Provider 包裹，API 简洁
- 天然支持 TypeScript，无需额外 redux-toolkit 样板代码
- 与 Next.js App Router 兼容性好（不依赖 React Context 渲染树）
- Jotai 适合原子化细粒度状态，当前业务以「业务域切片」为维度，Zustand 更适合

### Decision 2：Store 分割策略

按业务域分文件，不合并为单一大 Store：
```
src/stores/
  calorieStore.ts      # 卡路里条目
  userProfileStore.ts  # 用户档案
  healthAdviceStore.ts # 健康建议（含持久化）
```
**理由**：单一职责，文件体积可控（< 100 行/文件），便于按需订阅。

### Decision 3：healthAdviceStore 持久化方案

**选择**：`sessionStorage` 手动持久化（不用 `zustand/middleware` 的 `persist`）  
**理由**：
- Zustand `persist` 中间件在 Next.js SSR 场景有 hydration 问题
- sessionStorage 跨页不跨会话，符合「不刷新则复用」需求
- 手动实现仅 5-10 行，可控性强

**实现**：Store 初始化时从 `sessionStorage` 读取缓存，写入时同步持久化。

### Decision 4：保持现有接口不变

`useCalorieTracker` Hook 接口（`UseCalorieTrackerReturn`）和 `UserProfileContext` 接口均不变：
- 组件层零改动，降低回归风险
- Hook 内部改为从 Store 读取/写入，Store 成为数据源

### Decision 5：Store action 设计

Store 只暴露 state + actions，不直接依赖 `token`：
- Actions 接受 `token` 作为参数（从 `useAuth()` 传入）
- 避免 Store 与 Context 产生循环依赖

## Risks / Trade-offs

- **[风险] SSR hydration 不一致** → 所有 Store 使用 `"use client"` 限制，或在 Hook/Component 层访问（Next.js App Router 中 Zustand 仅在客户端运行）
- **[风险] sessionStorage 存储大体积 AI 建议** → 建议内容字符串通常 < 2KB，无压力
- **[Trade-off] userProfileStore 替代 Context** → 保留 Context 接口层，Store 作为底层数据源，不破坏现有组件树

## Migration Plan

1. 安装 `zustand`
2. 创建三个 Store 文件（`src/stores/`）
3. 改造 `useCalorieTracker` Hook → 读写 `calorieStore`
4. 改造 `UserProfileContext` → 读写 `userProfileStore`
5. 改造 `HealthAdviceCard` → 读写 `healthAdviceStore`
6. 验证：TypeScript 0 错误，页面功能回归正常

无需数据库迁移，无 API 变更，rollback 只需还原上述文件。

## Open Questions

- 无
