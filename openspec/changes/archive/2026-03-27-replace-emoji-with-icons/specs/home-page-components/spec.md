## MODIFIED Requirements

### Requirement: 页面标题使用 MUI Icon 组件统一图标规范

系统 SHALL 在所有页面级标题区域使用 `@mui/icons-material` SvgIcon 组件作为图标，不得使用 emoji 字符，以保持与其他 MUI 图标在颜色、尺寸、主题响应上的一致性。

#### Scenario: 概览标题展示 BarChartIcon

- **WHEN** 用户访问首页
- **THEN** 概览标题区域展示 `BarChartIcon`（color="primary"）+ Typography 文字，不含 emoji 字符

#### Scenario: 记录列表标题展示 ListAltIcon

- **WHEN** 用户访问首页记录区域
- **THEN** 记录标题区域展示 `ListAltIcon`（color="primary"）+ Typography 文字，不含 emoji 字符

#### Scenario: icon 响应 MUI 主题色

- **WHEN** 应用 MUI 主题切换（如 dark mode）
- **THEN** 标题 icon 随主题色变化，emoji 字符不受主题影响属于违规
