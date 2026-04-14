## Context

当前「新增记录」弹层（CreateRecordDialog）仅支持手动输入/选择预设项来填写食物名称和卡路里。后端已提供 `POST /gateway/ai/image-nutrition` 接口，支持上传食物图片并通过 AI（GPT-5-nano）分析返回结构化营养数据。前端需要对接此接口，在弹层中增加图片上传和分析能力。

现有 `lib/api.ts` 的 `request()` 函数固定设置 `Content-Type: application/json`，不支持 multipart/form-data 上传。

## Goals / Non-Goals

**Goals:**
- 在新增记录弹层中提供图片上传区域，支持点击选择图片
- 调用后端 AI 接口分析图片，获取食物和营养信息
- AI 结果自动填充表单字段（名称、卡路里）
- 多食物结果时允许用户选择
- 分析过程中展示 loading 状态

**Non-Goals:**
- 不支持拖拽上传（后续迭代）
- 不做图片裁剪/编辑
- 不在前端缓存分析结果
- 不修改后端 API
- 不做离线图片分析

## Decisions

### 1. 图片上传方式：原生 input[type=file] + MUI 样式封装

**选择**：使用隐藏的 `<input type="file" accept="image/*">` 配合 MUI Box 作为点击区域。

**替代方案**：
- 引入第三方上传库（react-dropzone 等）→ 过重，需求简单无需引入
- 使用 MUI 的 FileUpload 组件 → MUI v7 无官方 FileUpload 组件

**理由**：零依赖，原生 API 足够满足单图上传需求。

### 2. API 调用：独立函数直接使用 fetch，不改造 lib/api.ts

**选择**：在 `services/imageAnalysisService.ts` 中直接使用 `fetch` + `FormData`，不修改 `lib/api.ts` 的 `request()` 函数。

**替代方案**：
- 改造 `request()` 支持 multipart → 涉及面大，影响所有现有 API 调用
- 在 `lib/api.ts` 新增 `uploadRequest()` → 只有一个调用方，不值得抽象

**理由**：最小化修改范围，仅新增一个 service 文件。图片上传是特殊场景，不需要通用化。

### 3. 多食物结果处理：自动合并 + 展示明细

**选择**：当 AI 返回多个食物项时，默认合并（名称拼接、卡路里求和）自动填入表单，同时在下方展示各食物明细供用户查看。

**替代方案**：
- 弹出二级选择列表让用户逐个选择 → 流程过重，大部分场景用户拍的是一餐
- 只取第一个食物 → 丢失信息

**理由**：一餐多食物是常见场景，合并记录更符合用户习惯（记录的是一餐整体摄入）。

### 4. 图片预览：使用 URL.createObjectURL

**选择**：选择图片后通过 `URL.createObjectURL(file)` 生成本地预览 URL，组件卸载或清除时 `revokeObjectURL`。

**理由**：轻量、即时，无需转 base64 浪费内存。

### 5. 组件拆分策略

**选择**：新增 `ImageUploadAnalyzer` 子组件，封装图片选择、预览、分析逻辑，通过回调将分析结果传递给 `CreateRecordDialog`。

**理由**：CreateRecordDialog 已有 220+ 行代码，直接加入图片逻辑会使其过于臃肿。子组件职责单一，便于测试和复用。

## Risks / Trade-offs

- **[AI 分析耗时]** → 展示 loading 状态 + skeleton，按钮显示"分析中..."防止重复提交
- **[AI 分析失败]** → 展示错误提示，不阻断手动填写流程，用户仍可正常提交
- **[图片过大]** → 前端限制 5MB（与后端一致），超出时提示用户
- **[AI 返回不准确]** → 表单仍可手动编辑覆盖 AI 结果，AI 仅作辅助
- **[仅饮食类型可用]** → 图片分析仅在 type="intake" 时显示，运动类型隐藏此功能
