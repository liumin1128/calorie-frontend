## 1. 服务层

- [x] 1.1 新建 `src/services/adviceService.ts`，封装 `POST /gateway/ai/suggest`，固定 question 为「请根据我的个人数据给出健康建议」
- [x] 1.2 定义返回类型 `AdviceSuggestion`（`{ suggestion: string; model: string }`），添加到 `src/types/` 或内联在 adviceService 中

## 2. HealthAdviceCard 组件

- [x] 2.1 新建 `src/components/HealthAdviceCard.tsx`，接受 `token: string` 作为 prop
- [x] 2.2 组件内用 `useState` 管理 `advice`、`loading`、`error` 三个状态
- [x] 2.3 实现「获取健康建议」按鈕，点击时调用 `adviceService.getSuggestion`，加载中禁用按鈕并显示 `CircularProgress`
- [x] 2.4 成功后展示 suggestion 文本（`Typography sx={{ whiteSpace: 'pre-wrap' }}`），按鈕文案切换为「重新获取」
- [x] 2.5 失败时展示 `Alert` 错误提示，按鈕恢复可点击

## 3. 主页集成

- [x] 3.1 在 `src/app/page.tsx` 导入并渲染 `HealthAdviceCard`，放置于记录列表下方
- [x] 3.2 传入 `token` prop（来自 `useAuth()`）

## 4. 验证

- [x] 4.1 TypeScript 编译通过（`pnpm exec tsc --noEmit`）
- [ ] 4.2 手动测试：点击「获取健康建议」→ 显示加载状态 → 展示 AI 建议文本；重复点击「重新获取」可刷新内容
