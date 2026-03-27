## Why

当前 AI 健康建议功能嵌入在主页卡片中，与卡路里记录内容混杂，视觉层级不清晰，用户难以专注查看建议内容。将健康建议迁移至独立页面，并通过顶部导航栏提供入口，可提升功能可发现性与交互体验。

## What Changes

- **新增** `/health-advice` 路由页面，专用于展示 AI 健康建议
- **新增** 顶部导航栏（AppBar），统一放置在根布局或主页，含「首页」与「健康建议」两个导航项
- **移除** 主页中的 `HealthAdviceCard` 组件嵌入
- 健康建议页面复用现有 `HealthAdviceCard` 组件与 `adviceService`，无需修改服务层逻辑

## Capabilities

### New Capabilities

- `health-advice-page`: 独立健康建议页面（`/health-advice`），含页面路由、布局与导航守卫
- `top-navigation`: 顶部导航栏，提供主页与健康建议页的路由切换

### Modified Capabilities

- `health-advice`: 建议展示从主页内嵌迁移至独立页面，原主页不再包含 HealthAdviceCard

## Impact

- 影响文件：`src/app/page.tsx`（移除 HealthAdviceCard）、`src/app/layout.tsx`（新增导航栏）
- 新增文件：`src/app/health-advice/page.tsx`、`src/components/TopNavBar.tsx`
- 路由守卫：`middleware.ts` 需将 `/health-advice` 纳入受保护路由（默认已保护）
- 无后端 API 变更，无新增依赖
