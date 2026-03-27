## Why

项目中部分标题使用了 emoji（`📊` `📝`）作为图标，而其他区域（StatCard、CalorieRecordList 行内 Chip、ProfileSummaryCard 等）已统一使用 MUI Icon 组件。emoji 与 MUI icon 在颜色、尺寸、对齐、主题响应等方面表现不一致，影响整体视觉统一性。

## What Changes

- **移除** `src/app/page.tsx` 概览标题中的 `📊` emoji，替换为 `BarChartIcon`（`@mui/icons-material/BarChart`）
- **移除** `src/components/CalorieRecordList.tsx` 记录标题中的 `📝` emoji，替换为 `ListAltIcon`（`@mui/icons-material/ListAlt`）
- 两处标题统一采用 `Stack direction="row"` + `SvgIcon` + `Typography` 排版方式，与 `HealthAdviceCard` 标题风格一致

## Capabilities

### New Capabilities

（无新 capability，仅 UI 样式变更）

### Modified Capabilities

- `home-page-components`：页面标题 icon 从 emoji 改为 MUI SvgIcon，视觉规范统一

## Impact

- 影响文件：`src/app/page.tsx`、`src/components/CalorieRecordList.tsx`
- 新增 MUI icon 导入：`BarChartIcon`、`ListAltIcon`（已包含在 `@mui/icons-material`，无新依赖）
- 无 API 变更，无路由变更，无功能性变更
