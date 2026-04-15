## 1. RecordTypeSelector 类型选择面板

- [x] 1.1 创建 `components/RecordTypeSelector.tsx` 组件，使用 MUI Dialog + Slide 从底部弹出，展示 4 个入口卡片（AI 图片识别、二维码识别、手动输入饮食、运动记录）
- [x] 1.2 实现入口卡片视觉：图标 + 标题 + 描述，二维码入口 disabled 态 + 「即将支持」标签
- [x] 1.3 实现入口点击回调：关闭面板并通过 `onSelect(type)` 通知父组件用户选择了哪种入口

## 2. CreateRecordDialog 改造

- [x] 2.1 新增 `lockedType` prop，传入时隐藏类型切换 ToggleButton，强制使用指定类型
- [x] 2.2 新增 `autoTriggerImage` prop，为 true 时弹窗打开后自动触发图片上传选择器
- [x] 2.3 ImageUploadAnalyzer 支持通过 ref 暴露 `triggerFileSelect()` 方法

## 3. CalorieRecordList 分栏展示

- [x] 3.1 在 CalorieRecordList 顶部增加 MUI Tabs（全部 / 饮食 / 运动）
- [x] 3.2 实现 Tab 切换过滤逻辑：根据选中 Tab 过滤 entries 列表
- [x] 3.3 各标签页显示对应类型的卡路里小计统计
- [x] 3.4 空状态处理：当前标签无记录时显示「暂无饮食/运动记录」

## 4. 首页集成

- [x] 4.1 修改 `page.tsx` 中 FAB 的 onClick 行为：点击打开 RecordTypeSelector 而非直接打开 CreateRecordDialog
- [x] 4.2 实现 RecordTypeSelector 的 onSelect 回调：根据选择类型打开对应模式的 CreateRecordDialog
- [x] 4.3 更新 `useCalorieTracker` hook 管理新的状态（selectorOpen、lockedType、autoTriggerImage）
