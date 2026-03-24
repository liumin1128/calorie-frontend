## Why

当前前端的用户个人信息（性别、年龄、身高、体重等）完全使用本地硬编码模拟数据，未对接后端 API。用户无法持久化个人资料，也无法记录身高体重的历史变化。后端已提供完整的用户资料管理（`/user/profile`）和身体指标时序数据（`/dynamic-data`）接口，前端需要完成对接以实现真正的用户信息管理闭环。

## What Changes

- 新建 `userService` 和 `dynamicDataService` 服务层，封装后端用户资料和身体指标 API
- 新建 `UserProfileContext`，登录时自动获取一次完整用户信息，支持手动刷新
- 改造 `ProfileDialog` 组件，对接后端 API：基础信息（昵称、性别、生日、个性签名）通过表单提交到 `/user/profile`；身高体重通过 `/dynamic-data` 写入动态数据表
- 替换主页面中所有本地模拟的用户数据（`initialProfile`、`initialWeightHistory`），使用 Context 提供的真实数据
- 新增用户信息相关的 TypeScript 类型定义

## Capabilities

### New Capabilities
- `user-profile`: 用户个人信息的获取、展示与编辑，包括基础资料管理和身体指标（身高/体重）的录入与查询

### Modified Capabilities

## Impact

- **新增文件**：`src/services/userService.ts`、`src/services/dynamicDataService.ts`、`src/contexts/UserProfileContext.tsx`、`src/types/user.ts`
- **修改文件**：`src/components/ProfileDialog.tsx`、`src/app/page.tsx`、`src/app/layout.tsx`、`src/lib/api.ts`（可能新增端点函数）
- **依赖**：无新增外部依赖，复用现有 MUI 组件和 `request()` HTTP 客户端
- **后端 API**：依赖 `/user/profile`（PUT）、`/user/full-profile`（GET）、`/dynamic-data`（POST/GET）
