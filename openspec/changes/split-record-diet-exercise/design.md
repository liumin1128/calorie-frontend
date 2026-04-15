## Context

当前首页通过右下角 FAB 按钮直接打开 `CreateRecordDialog`，弹窗内通过 ToggleButton 切换饮食/运动类型。饮食类型内嵌 `ImageUploadAnalyzer` 组件支持图片识别。所有记录在 `CalorieRecordList` 中混合展示。

用户反馈：记录入口单一，饮食和运动混排不利于对比；缺少扫码等快捷录入方式。

## Goals / Non-Goals

**Goals:**
- FAB 点击后展示类型选择面板，提供 4 种录入入口
- 根据选择的入口类型，直接进入对应录入流程（跳过类型切换步骤）
- 记录列表按饮食/运动分栏展示
- 二维码扫描入口预留占位

**Non-Goals:**
- 不实现二维码扫描功能（仅 UI 占位）
- 不修改后端 API
- 不修改数据模型（`CalorieEntry` 类型不变）
- 不修改编辑/删除记录流程

## Decisions

### 1. 类型选择面板采用 BottomSheet 风格弹层

**选择**：使用 MUI `Dialog` + `Slide` 从底部弹出的半屏面板，展示 4 个入口卡片。

**替代方案**：
- SpeedDial：MUI 自带的扇形展开，但 4 个入口信息承载量不足，无法放置图标说明
- Popover：从 FAB 位置弹出气泡，移动端体验不佳

**理由**：BottomSheet 符合移动端操作习惯，空间充裕可展示图标 + 文字 + 描述，且与现有设计语言一致。

### 2. 新增 RecordTypeSelector 面板组件

**选择**：新建 `components/RecordTypeSelector.tsx`，包含 4 个类型入口卡片：
- AI 图片识别（直接打开相机/相册后进入图片分析流程）
- 二维码识别（disabled 态，提示「即将支持」）
- 手动输入饮食（打开 CreateRecordDialog，类型锁定为 intake）
- 运动记录（打开 CreateRecordDialog，类型锁定为 burn）

**理由**：独立组件职责清晰，不侵入现有 CreateRecordDialog 逻辑。

### 3. CreateRecordDialog 支持预设类型锁定

**选择**：为 `CreateRecordDialog` 新增 `lockedType` prop，传入时隐藏类型切换 ToggleButton，强制使用指定类型。

**替代方案**：拆分为 `DietRecordDialog` 和 `ExerciseRecordDialog` 两个独立组件。

**理由**：现有弹窗逻辑 90% 复用（标题、卡路里、日期、预设列表），拆分会造成大量重复代码。通过 `lockedType` prop 最小化改动。

### 4. 图片识别作为独立入口的流程

**选择**：从类型选择面板选择「AI 图片识别」后，直接打开 CreateRecordDialog（lockedType=intake），并自动触发 ImageUploadAnalyzer 的文件选择。

**理由**：复用现有图片分析组件和弹窗表单，避免重复开发。用户选择图片 → AI 分析 → 自动填充表单 → 确认提交，流程一步到位。

### 5. 记录列表分栏采用 Tab 切换

**选择**：在 `CalorieRecordList` 顶部增加 MUI `Tabs`（全部 / 饮食 / 运动），默认「全部」，切换时过滤列表。

**替代方案**：左右双列并排展示饮食和运动。

**理由**：移动端屏幕宽度有限，双列会导致内容过窄。Tab 切换更适合响应式布局，且保留「全部」视图兼容当前使用习惯。

## Risks / Trade-offs

- **[二维码入口占位]** → 用户可能对「即将支持」感到不满。通过 disabled 视觉态 + 提示文案降低预期。
- **[流程步骤增加]** → 新增类型选择步骤，比原来直接打开弹窗多一步操作。通过面板动画流畅性和类型入口的直观性弥补。
- **[CreateRecordDialog 复杂度]** → 新增 `lockedType` 和 `autoTriggerImage` props 会增加组件接口。控制在 2 个新 prop 以内，逻辑分支简单。
