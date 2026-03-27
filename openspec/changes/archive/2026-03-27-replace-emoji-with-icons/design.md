## Context

项目使用 MUI v7，已有大量页面使用 `@mui/icons-material` SvgIcon 组件作为图标（`RestaurantIcon`、`FitnessCenterIcon`、`PersonIcon`、`AutoAwesomeIcon` 等）。但两处页面区域标题仍使用 emoji 文字字符，导致图标渲染方式不一致：emoji 不受 MUI 主题色影响，跨平台字形差异较大。

## Goals / Non-Goals

**Goals:**
- 将 `📊`（概览标题）替换为 `BarChartIcon`
- 将 `📝`（记录标题）替换为 `ListAltIcon`
- 标题区域排版统一为 `Stack direction="row" + Icon + Typography`，与 `HealthAdviceCard` heading 风格对齐

**Non-Goals:**
- 不重构标题之外的其他 UI 区域
- 不引入新的 icon 库，仅使用已安装的 `@mui/icons-material`

## Decisions

### Decision 1：icon 选型

- `📊` → `BarChartIcon`：语义最接近「统计概览」，MUI 已内置
- `📝` → `ListAltIcon`：语义对应「记录列表」，MUI 已内置
- icon 使用 `color="primary"` 保持与主题色联动

### Decision 2：排版方式

采用 `<Stack direction="row" alignItems="center" spacing={1}>` 包裹 `Icon + Typography`，与 `HealthAdviceCard` 标题区域（`Box + gap`）等价但更语义化：

```tsx
<Stack direction="row" alignItems="center" spacing={1}>
  <BarChartIcon color="primary" />
  <Typography variant="h5" fontWeight="bold">
    {isToday ? "今日概览" : `${selectedDate} 概览`}
  </Typography>
</Stack>
```

## Risks / Trade-offs

- 改动范围极小（2 处 Typography 文字），回归风险极低
- icon 尺寸默认为 `medium`（24px），与 `h5` 字号视觉上匹配
