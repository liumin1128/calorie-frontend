## Context

当前健康建议功能（`HealthAdviceCard` 组件）嵌入在 `src/app/page.tsx` 主页中，与卡路里记录、体重数据并列展示。随着功能扩展，主页内容密度增加，健康建议与主要追踪内容混杂，降低了整体可读性。

本次变更在导航层面为健康建议提供独立入口，利用 Next.js App Router 的文件系统路由新增 `/health-advice` 页面，并在顶部统一放置跨页面导航栏。

## Goals / Non-Goals

**Goals:**
- 新增 `/health-advice` 独立页面，完整承载健康建议交互
- 新增 `TopNavBar` 顶部导航组件，提供「首页」/「健康建议」切换
- 从主页移除 `HealthAdviceCard`，精简主页内容

**Non-Goals:**
- 不修改 `adviceService.ts` 及后端接口
- 不对 `HealthAdviceCard` 组件内部逻辑做任何改动
- 不引入新的状态管理库或路由库
- 不实现多级菜单或响应式折叠导航（移动端简化处理即可）

## Decisions

### 决策 1：TopNavBar 放在根布局 `layout.tsx`

**选择**：将 `TopNavBar` 注入到 `src/app/layout.tsx` 的 `<body>` 中，位于页面内容上方。

**理由**：
- App Router 布局天然适合放全局 UI（AppBar、Footer）
- 避免在每个页面重复引入导航组件
- login/register 页面不需要导航栏，可通过条件渲染或嵌套 layout 隔离

**替代方案**：在每个页面单独引入 → 重复代码，违反 DRY 原则，弃用。

**实现**：在 `src/app/(protected)/layout.tsx` 中放置 TopNavBar，与登录/注册页面区分（protected group layout）。如不使用 route group，也可直接在 `layout.tsx` 通过 `usePathname` 判断是否显示导航。

> 最简方案：直接在根 `layout.tsx` 判断路径，非 `/login`、`/register` 时渲染顶部导航。

### 决策 2：使用 Next.js `Link` + MUI `AppBar` 实现导航

**选择**：`TopNavBar` 基于 MUI `AppBar` + `Toolbar` + `Button`（包裹 `Link`）实现。

**理由**：
- 与现有 MUI 主题（暖色系 AppBar、`borderRadius: 16`）无缝集成
- Next.js `Link` 提供客户端导航，避免全页刷新
- 无需新增任何导航库

### 决策 3：`/health-advice` 路由由 middleware 默认保护

**选择**：不修改 `middleware.ts`，依赖现有逻辑（非白名单路径均需登录）。

**理由**：现有中间件已覆盖所有非 `/login`、`/register` 路径，新路由自动受保护。

## Risks / Trade-offs

- **根布局渲染 TopNavBar 导致登录页出现导航栏** → 通过在 `layout.tsx` 中使用 `usePathname` 判断当前路由，登录/注册页跳过渲染；或采用 route group 隔离（`(auth)` group 无 NavBar，`(app)` group 有 NavBar）。建议使用 `usePathname` 方案，改动最小。
- **主页移除 HealthAdviceCard 后页面高度变化** → 低风险，调整 layout spacing 即可。
