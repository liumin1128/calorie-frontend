## 1. 新增顶部导航组件

- [x] 1.1 创建 `src/components/TopNavBar.tsx`，使用 MUI `AppBar` + `Toolbar` + `Button`（`Link` 包裹），包含「首页」和「健康建议」两个导航项
- [x] 1.2 使用 `usePathname` 判断当前激活路由，对应导航项显示高亮样式（激活色与主题一致）

## 2. 根布局集成导航栏

- [x] 2.1 在 `src/app/layout.tsx` 中引入 `TopNavBar`，使用 `usePathname` 判断仅在非 `/login`、`/register` 路径时渲染
- [x] 2.2 调整根布局主体区域顶部间距，避免内容被导航栏遮挡（`pt` 或 `mt` 适配 AppBar 高度）

## 3. 新增健康建议独立页面

- [x] 3.1 创建 `src/app/health-advice/page.tsx`，引入并展示 `HealthAdviceCard` 组件

## 4. 精简主页内容

- [x] 4.1 在 `src/app/page.tsx` 中移除 `HealthAdviceCard` 组件的引入和渲染
- [x] 4.2 清理主页中与健康建议相关的 import 语句

## 5. 验证

- [x] 5.1 验证 `/` 主页不再出现健康建议卡片
- [x] 5.2 验证 `/health-advice` 页面健康建议功能完整可用（点击获取、loading、展示结果）
- [x] 5.3 验证顶部导航栏在首页和健康建议页正确显示，激活项高亮正确
- [x] 5.4 验证登录/注册页面不显示导航栏
- [x] 5.5 验证未登录用户访问 `/health-advice` 被重定向到 `/login`
