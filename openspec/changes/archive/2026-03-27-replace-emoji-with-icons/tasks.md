## 1. page.tsx 概览标题

- [x] 1.1 在 `src/app/page.tsx` 导入 `BarChartIcon`（`@mui/icons-material/BarChart`）
- [x] 1.2 将概览标题 `📊 {isToday ? "今日概览" : ...}` 替换为 `BarChartIcon + Typography` 的 Stack 组合

## 2. CalorieRecordList 记录标题

- [x] 2.1 在 `src/components/CalorieRecordList.tsx` 导入 `ListAltIcon`（`@mui/icons-material/ListAlt`）
- [x] 2.2 将记录标题 `📝 {isToday ? "今日记录" : ...}` 替换为 `ListAltIcon + Typography` 的 Stack 组合

## 3. 验证

- [x] 3.1 TypeScript 编译 0 错误
- [x] 3.2 确认两处标题无 emoji 字符，icon 颜色跟随 primary 主题色
