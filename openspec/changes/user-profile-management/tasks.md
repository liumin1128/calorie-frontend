## 1. 类型定义

- [x] 1.1 新建 `src/types/user.ts`，定义用户资料相关类型（`UserFullProfile`、`UpdateProfileDto`、`DynamicDataRecord`、`CreateDynamicDataDto`、`QueryLatestParams` 等）

## 2. 服务层

- [x] 2.1 新建 `src/services/userService.ts`，封装 `getFullProfile(token)` 和 `updateProfile(token, data)` 方法
- [x] 2.2 新建 `src/services/dynamicDataService.ts`，封装 `create(token, data)` 和 `getLatest(token, params)` 方法

## 3. 全局状态

- [x] 3.1 新建 `src/contexts/UserProfileContext.tsx`，实现 `UserProfileProvider`，提供 `profile`、`loading`、`refreshProfile()` 状态和方法
- [x] 3.2 在 `UserProfileContext` 中监听 AuthContext 的 user/token 变化，登录后自动调用 `getFullProfile` 加载用户信息
- [x] 3.3 在 `src/app/layout.tsx` 中将 `UserProfileProvider` 嵌套在 `AuthProvider` 内部

## 4. ProfileDialog 改造

- [x] 4.1 改造 `src/components/ProfileDialog.tsx`，从 UserProfileContext 读取真实用户数据填充表单
- [x] 4.2 实现保存逻辑：基础资料调用 `userService.updateProfile`，身高体重变化时调用 `dynamicDataService.create`
- [x] 4.3 保存成功后调用 `refreshProfile()` 刷新全局用户信息

## 5. 主页面对接

- [x] 5.1 改造 `src/app/page.tsx`，移除 `initialProfile` 和 `initialWeightHistory` 等本地模拟数据
- [x] 5.2 从 UserProfileContext 读取真实用户数据用于 BMR 计算和展示
- [x] 5.3 处理用户信息加载中和无数据时的降级展示
