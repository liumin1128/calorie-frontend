## Why

当前应用完全依赖 React 内置 `useState` + Context 管理数据，组件间数据共享需层层透穿 props 或通过 Context re-render 整棵树。随着首页、健康建议页、用户信息等数据维度增加，开发效率和运行性能均受限。引入 Zustand 作为轻量全局状态层，并对健康建议数据做持久化，可以显著减少重复请求和不必要的渲染。

## What Changes

- 新增 `src/stores/` 目录，按业务域拆分 Zustand Store
- **新增** `calorieStore`：管理卡路里条目列表、选中日期、加载/错误状态，替代 `useCalorieTracker` Hook 内的本地状态
- **新增** `userProfileStore`：管理用户档案数据，替代 `UserProfileContext` 内的本地状态
- **新增** `healthAdviceStore`：管理健康建议数据，支持 sessionStorage 持久化（会话内不重复请求）
- `useCalorieTracker` Hook 保持接口不变，内部改为从 `calorieStore` 读写状态
- `UserProfileContext` 保持接口不变，内部改为从 `userProfileStore` 读写状态
- `HealthAdviceCard` 改为从 `healthAdviceStore` 读取数据，不刷新页面则使用缓存
- 认证状态保留在 `AuthContext`（不迁移，职责边界清晰）

## Capabilities

### New Capabilities

- `zustand-calorie-store`：Zustand Store 管理卡路里条目列表与分页状态，提供 actions 供 Hook 调用
- `zustand-user-profile-store`：Zustand Store 管理用户档案数据，Context 作为接口层透传
- `zustand-health-advice-store`：Zustand Store 管理健康建议，持久化到 sessionStorage，会话内命中缓存则跳过请求

### Modified Capabilities

- `calorie-management`：卡路里状态来源从 Hook 本地 useState 迁移到 Zustand Store，行为规格不变
- `health-advice`：健康建议新增会话级缓存能力（不刷新不重复请求）
- `home-page-components`：`useCalorieTracker` 内部实现变更（读写 Store），对外接口 `UseCalorieTrackerReturn` 不变

## Impact

- 新增依赖：`zustand`（轻量 ~1KB gzip）
- 影响文件：`src/hooks/useCalorieTracker.ts`、`src/contexts/UserProfileContext.tsx`、`src/components/HealthAdviceCard.tsx`、`src/services/adviceService.ts`
- 新增目录：`src/stores/`（3 个文件）
- 无 API 接口变更，无路由变更，无破坏性改动
