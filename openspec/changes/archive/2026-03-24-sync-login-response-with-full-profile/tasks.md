## 1. 类型修正

- [x] 1.1 更新 `src/lib/api.ts`：将 `AuthResponse.user` 类型从 `{ id: string; email: string; nickname: string }` 改为 `UserFullProfile`（从 `@/types/user` 导入）

## 2. UserProfileContext 扩展

- [x] 2.1 在 `src/contexts/UserProfileContext.tsx` 中，向 `UserProfileContextType` 新增 `setProfileFromAuth(profile: UserFullProfile): void` 方法
- [x] 2.2 在 `UserProfileProvider` 中实现 `setProfileFromAuth`，直接将传入的 profile 数据设为当前 `profile` 状态

## 3. AuthContext 对接

- [x] 3.1 在 `src/contexts/AuthContext.tsx` 中，通过 `useUserProfile()` 获取 `setProfileFromAuth` 方法
- [x] 3.2 在 `login` 函数成功后，调用 `setProfileFromAuth(res.user)` 将登录响应中的完整用户画像注入 UserProfileContext
- [x] 3.3 在 `register` 函数成功后，同样调用 `setProfileFromAuth(res.user)`

## 4. 验证

- [x] 4.1 确认登录后 `UserProfileContext.profile` 立即可用（无需等待额外请求）
- [x] 4.2 确认保存个人信息后调用 `refreshProfile()` 仍能正常刷新数据
- [x] 4.3 确认登出后 profile 被清空
- [x] 4.4 运行 TypeScript 编译检查，确保无类型错误
