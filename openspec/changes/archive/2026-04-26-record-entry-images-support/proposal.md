## Why

当前前端已经支持 AI 识图分析与条码扫码预览，但在用户保存卡路里记录时，图片本身没有随记录持久化到后端 `images` 字段，导致记录列表与编辑回显无法展示来源图片。后端图片上传分析链路与记录模型已经具备承载能力，现在需要把前端的图片上传、URL 回填、记录保存与图片展示完整打通。

## What Changes

- 在 AI 识图与条码扫码保存记录时，复用后端已实现的图片上传能力，将图片上传后得到的 URL 写入卡路里记录的 `images` 字段。
- 为饮食记录补齐图片附件的前端类型、服务与提交流程，确保创建、编辑、批量 AI 识图保存、扫码确认保存都能携带图片 URL。
- 拆分图片上传组件的 UI 与业务逻辑，沉淀可复用的图片选择、预处理、上传状态管理能力，减少 `CreateRecordDialog` 与 AI/扫码流程中的耦合。
- 在记录列表、记录编辑回显与相关预览界面中支持已保存图片的展示，保证用户能看到并复用历史图片。

## Capabilities

### New Capabilities
- `record-image-attachments`: 统一饮食记录图片附件上传、保存 URL、展示与回显能力。

### Modified Capabilities
- `calorie-management`: 记录创建、编辑与列表回显的规格需要扩展到图片附件场景。
- `calorie-service`: 记录创建/更新 DTO 与服务契约需要明确支持 `images` 字段提交与回传。
- `image-nutrition-analysis`: AI 图片分析入口需要支持分离 UI/逻辑并与记录图片持久化链路协同。

## Impact

- 前端受影响模块：`src/components/CreateRecordDialog.tsx`、`src/components/ImageUploadAnalyzer.tsx`、`src/components/AiAnalysisPreview.tsx`、`src/components/BarcodeScanner.tsx`、`src/components/CalorieRecordList.tsx`、`src/hooks/useCalorieTracker.ts`、`src/services/imageAnalysisService.ts`、`src/services/calorieService.ts`、`src/types/calorie.ts`。
- 可能新增独立图片上传/记录图片组件、hooks 或 services，用于分离 UI 和上传逻辑。
- 依赖现有后端 `../backend` 的图片上传与卡路里记录接口，无需新增前端路由层。