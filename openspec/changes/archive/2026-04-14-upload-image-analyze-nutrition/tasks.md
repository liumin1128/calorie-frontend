## 1. 类型定义

- [x] 1.1 在 `types/calorie.ts` 中新增图片分析响应类型（`ImageNutritionFood`、`ImageNutritionResponse`）

## 2. 服务层

- [x] 2.1 创建 `services/imageAnalysisService.ts`，封装 `POST /gateway/ai/image-nutrition` 调用（FormData + Bearer Token）

## 3. 图片上传分析组件

- [x] 3.1 创建 `components/ImageUploadAnalyzer.tsx` 组件，包含：图片选择（input[type=file]）、预览（URL.createObjectURL）、格式/大小校验、「分析」按钮、loading 状态、错误提示
- [x] 3.2 实现多食物结果合并逻辑：名称拼接、卡路里求和，并通过 `onAnalyzed` 回调传递结果
- [x] 3.3 实现分析结果明细展示（多食物项时显示各项名称和卡路里）
- [x] 3.4 实现清除图片/分析结果功能

## 4. 集成到新增记录弹层

- [x] 4.1 在 `CreateRecordDialog.tsx` 中引入 `ImageUploadAnalyzer`，仅在 type="intake" 时渲染
- [x] 4.2 接收 `onAnalyzed` 回调，自动填充 title 和 calories 字段
- [x] 4.3 切换到「运动」类型时清除图片相关状态
- [x] 4.4 弹窗关闭/重置时清除图片相关状态
