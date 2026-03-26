## Why

后端 API 已完整支持「目标体重（targetWeight）」和「健康状况（healthConditions）」两个字段，但前端的类型定义、服务层和界面均未实现，导致用户无法在 App 内查看和编辑这两项健康信息，功能存在缺口。

## What Changes

- 扩展 `UserFullProfile` 类型，添加 `targetWeight` 和 `healthConditions` 字段
- 扩展 `UpdateProfileDto` 类型，添加 `targetWeight` 和 `healthConditions` 字段
- 在 `ProfileDialog.tsx` 中新增目标体重输入框（数字，30–300 kg）和健康状况标签输入（可增减的 Chip 列表）
- 保存时将两个字段随基础资料一起提交给 `/user/profile` 接口

## Capabilities

### New Capabilities

- `user-health-fields`: 用户目标体重和健康状况字段的前端展示与编辑能力

### Modified Capabilities

- `user-profile`: 扩展用户资料的类型定义与表单，支持目标体重和健康状况字段读写

## Impact

- `src/types/user.ts` — 新增字段类型定义
- `src/services/userService.ts` — 无需改动（已有 `updateProfile` 函数，通过 DTO 传递字段）
- `src/components/ProfileDialog.tsx` — 新增两个表单字段（UI + 逻辑）
- 无破坏性变更，无新的外部依赖
