## 1. 类型定义扩展

- [x] 1.1 在 `src/types/user.ts` 的 `UserFullProfile` 接口中添加 `targetWeight?: number | null` 和 `healthConditions?: string[] | null` 字段
- [x] 1.2 在 `src/types/user.ts` 的 `UpdateProfileDto` 接口中添加 `targetWeight?: number` 和 `healthConditions?: string[]` 字段

## 2. ProfileDialog 表单扩展

- [x] 2.1 在 `FormState` 中添加 `targetWeight: number` 和 `healthConditions: string[]` 字段
- [x] 2.2 扩展 `buildInitialForm` 函数，从 `profile` 读取 `targetWeight` 和 `healthConditions` 回填表单
- [x] 2.3 在 `handleSave` 中将 `targetWeight`（值 > 0 时）和 `healthConditions` 加入 `updateProfile` 的 payload
- [x] 2.4 在表单 UI 中添加「目标体重 (kg)」数字输入框（step=0.1，范围 30–300）
- [x] 2.5 在表单 UI 中添加健康状况 Chip 标签区域：展示已有标签、支持按 Enter 添加、点击关闭删除
- [x] 2.6 添加健康状况单项超过 50 字符时的客户端校验与提示
- [x] 2.7 引入所需的 MUI Chip 和相关组件（按需导入，tree-shaking）

## 3. 验证

- [x] 3.1 TypeScript 编译通过，无类型错误（`pnpm build` 或 `tsc --noEmit`）
- [ ] 3.2 手动测试：打开 ProfileDialog，填写目标体重和健康状况标签，保存后重新打开弹窗可见回填数据
