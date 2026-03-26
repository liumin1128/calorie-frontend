## Why

用户已能在主页查看每日卡路里摄入/消耗数据，但缺乏专业的健康指导。后端已提供 `POST /gateway/ai/suggest` 接口，能自动整合用户档案（体重、目标体重、健康状况等）和近 7 天饮食/运动记录，由 AI 生成个性化健康建议，只差前端接入。

## What Changes

- 新增 `services/adviceService.ts`：封装 `POST /gateway/ai/suggest` 的调用
- 在主页（`page.tsx`）添加「获取健康建议」按钮，点击后异步请求 AI 建议并展示结果
- 建议展示区域含 Markdown 格式文本、加载状态、错误状态
- 按钮仅手动点击触发，不自动调用（避免无限请求或页面加载时消耗 AI 额度）

## Capabilities

### New Capabilities

- `health-advice`: 用户手动触发、基于个人数据的 AI 健康建议请求与展示能力

### Modified Capabilities

（无，主页加入新模块不涉及现有 spec 的行为变更）

## Impact

- `src/services/adviceService.ts` — 新建服务层文件
- `src/app/page.tsx` — 新增健康建议卡片 UI（按钮、加载态、结果展示）
- 无破坏性变更，无新的外部 npm 依赖
