## Context

后端 `PUT /user/profile` 接口已通过 `UpdateProfileDto` 支持 `targetWeight`（数字，30–300 kg）和 `healthConditions`（字符串数组，最多 20 项，每项最多 50 字符）字段；`GET /user/full-profile` 也已返回这两个字段。前端类型定义（`UserFullProfile`、`UpdateProfileDto`）和 `ProfileDialog.tsx` 表单均未同步，导致功能缺口。

## Goals / Non-Goals

**Goals:**
- 在 `src/types/user.ts` 中补全两个字段的类型定义
- 在 `ProfileDialog.tsx` 中新增「目标体重」输入框和「健康状况」Chip 标签输入 UI
- 保存时将两个字段一并提交 `/user/profile`

**Non-Goals:**
- 不引入新的外部依赖
- 不更改 `UserProfileContext` 或 `userService.ts`（已有接口满足需求）
- 不在主页面做额外展示（本次仅聚焦编辑表单）
- 不做 `healthConditions` 的预设枚举选项（自由输入）

## Decisions

### 1. 类型扩展而非新建

直接在 `UserFullProfile` 和 `UpdateProfileDto` 中追加可选字段，不新建类型。原因：字段归属明确，接口 payload 不变，最小改动原则。

### 2. `healthConditions` 使用 Chip + TextField 输入模式

使用 MUI `Chip` 展示已有标签，用户在输入框按 Enter/逗号 添加新标签，点击 Chip 的关闭按钮删除。
- 备选方案：`Autocomplete` + freeSolo — UI 较重，且需引入额外的 `ListboxComponent`，不符合简洁原则。
- 备选方案：简单 `TextField`（逗号分隔字符串）— 体验不直观，易出错。

### 3. 目标体重为 number 类型，复用现有 TextField type="number"

与 height/weight 保持一致的 UI 模式，`step=0.1`，范围 30–300，空值时不提交（传 `undefined`）。

### 4. 表单字段初始化与 `buildInitialForm` 保持一致

扩展现有的 `buildInitialForm` 函数，读取 `profile.targetWeight` 和 `profile.healthConditions`，避免冗余逻辑。

## Risks / Trade-offs

- [风险] 用户输入 `healthConditions` 单项超过 50 字符 → 后端会返回 400 → 前端应在 Enter 时截断或提示，添加客户端校验
- [风险] `ProfileDialog.tsx` 加入新字段后行数增加，接近 200 行阈值 → 若后续再扩展应考虑拆分子组件
