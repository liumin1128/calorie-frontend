## Why

用户手动输入饮食记录效率低、卡路里估算不准确。通过拍照/上传食物图片并调用后端 AI 分析接口，可以自动识别食物及其营养成分，一键填充表单，大幅提升记录效率和准确度。

## What Changes

- 在「新增记录」弹层（CreateRecordDialog）中新增图片上传区域，支持点击上传或拍照
- 上传图片后展示预览缩略图
- 新增「分析」按钮，调用后端 `POST /gateway/ai/image-nutrition` 接口解析图片中的食物和营养信息
- AI 返回结果后自动填充表单（食物名称、卡路里等字段）
- 若 AI 返回多个食物项，提供选择能力让用户选取或合并
- 新增 `imageAnalysisService` 封装图片分析 API 调用（multipart/form-data）

## Capabilities

### New Capabilities
- `image-nutrition-analysis`: 图片上传与 AI 营养成分分析能力，覆盖图片选择、上传、AI 接口调用、结果解析与表单自动填充

### Modified Capabilities
- `calorie-management`: 新增记录弹层中增加图片上传入口和分析触发流程

## Impact

- **组件**：`CreateRecordDialog.tsx` 需重构，新增图片上传区域和分析按钮
- **服务层**：新增 `services/imageAnalysisService.ts`，封装 multipart/form-data 上传逻辑
- **API 层**：`lib/api.ts` 可能需要支持非 JSON 的 multipart 请求（当前固定 Content-Type: application/json）
- **类型**：新增图片分析响应类型定义
- **依赖**：无新增第三方依赖，使用原生 FormData API
