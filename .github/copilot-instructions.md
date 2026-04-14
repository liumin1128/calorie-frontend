# CaloTrack 设计系统提示词

> 适用于所有页面和组件开发，确保视觉一致性。

## 设计定位

- **风格**：极致简约 · 清新自然 · 现代化 UI
- **情绪**：无压力、健康管理、高效记录
- **品牌字体**：`Instrument Serif`（Google Fonts, weight 400），用于品牌名 "CaloTrack"
- **正文字体**：`"Avenir Next","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif`

## 色彩体系（鼠尾草绿）

| 角色   | 色值                   | MUI Token            |
| ------ | ---------------------- | -------------------- |
| 主色   | `#3d6b4f`              | `primary.main`       |
| 主色浅 | `#6b9b7a`              | `primary.light`      |
| 主色深 | `#2d5a3f`              | `primary.dark`       |
| 辅色   | `#a5d6a7`              | `secondary.main`     |
| 辅色浅 | `#d0e8d0`              | `secondary.light`    |
| 辅色深 | `#6b9b5e`              | `secondary.dark`     |
| 背景   | `#fafaf5`（暖白/米白） | `background.default` |
| 纸面   | `#ffffff`              | `background.paper`   |
| 主文字 | `#2a2a2a`              | `text.primary`       |
| 次文字 | `#8a8a82`              | `text.secondary`     |
| 分割线 | `#d8d8d0`              | `divider`            |
| 警告   | `#f49420`              | `warning.main`       |
| 成功   | `#4a7a40`              | `success.main`       |

## 空间与圆角

- 全局圆角：`12px`（`theme.shape.borderRadius`）
- 按钮圆角：`12px`
- Chip：胶囊形 `999px`
- 弹窗：`16px`
- 卡片边框：`1px solid rgba(61,107,79,0.10)`（细边框代替重阴影）

## 背景与氛围

- 全局 body：双层径向渐变 `#e8f3e8` + `#d0e4d0`，基底 `#fafaf5`，`background-attachment: fixed`
- 插画面板渐变参考：`linear-gradient(160deg, secondary.light 0%, secondary.main 55%, #f2ede4 100%)`
- 装饰元素：半透明白色圆形 `rgba(255,255,255,0.12~0.18)`

## 组件风格

- **AppBar**：半透明磨砂 `rgba(250,250,245,0.85)` + `backdrop-filter: blur(8px)` + 细边线，无阴影
- **Button contained**：纯色 `#3d6b4f`，hover 加深 + 柔和阴影，无默认 boxShadow
- **TextField**：优先使用 `variant="standard"` 仅下划线样式，聚焦态下划线使用 `primary.main`
- **Card**：细边框，低 elevation
- **Fab**：柔和绿色光晕 `0 8px 20px rgba(61,107,79,0.18)`

## 动效

- 页面入场：`fadeUp`（opacity 0→1, translateY 22px→0, 0.7s ease-out）
- 面板淡入：`fadeIn`（opacity 0→1, 0.8s ease-out）
- 插画浮动：`gentleFloat`（translateY 0→-6px→0, 6s ease-in-out infinite）
- 动画使用 `@emotion/react` 的 `keyframes`

## 插画风格

- 使用本地 SVG，存放于 `public/illustrations/`
- 风格：现代扁平风，水果/健康食材主题
- 配色与主色系统协调（鼠尾草绿 + 暖调辅色）
- 配合 `next/image` 加载，添加 `drop-shadow()` 增加层次

## 响应式策略

- 分屏布局断点：`sm`（600px），低于600px纵向堆叠
- 右侧面板固定宽度（400~480px），左侧 flex:1 自适应

## 注意事项

- 所有颜色使用 MUI theme token（如 `"primary.main"`、`"text.secondary"`），禁止硬编码色值
- 需要 theme 对象时使用 `sx` 回调：`sx={(theme) => ({...})}`
- 浏览器 autofill 覆盖：`:-webkit-autofill` 用 `WebkitBoxShadow: "0 0 0 100px #fafaf5 inset"` 消除蓝色背景
- 第三方登录按钮未接入时使用 disabled 态 + "即将支持" 提示
- 严禁使用意义不明的 emoji
