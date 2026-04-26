## Why

用户在新增饮食记录后只能看到记录已保存，无法立即获得针对这条记录的反馈，新增流程缺少闭环。后端已经提供单条记录 AI 点评接口，前端需要把这条反馈接入到现有饮食记录卡片中，让用户在完成记录后立即看到点评结果。

## What Changes

- 在首页饮食记录卡片中新增一个点评 Alert 区域，用于展示最近一次新增饮食记录的 AI 点评。
- 在 calorieService 中新增单条卡路里记录点评接口封装，调用后端 `POST /calorie/:id/comment`。
- 在新增饮食记录成功后，基于新建记录返回的 `_id` 请求点评数据，并将结果绑定到饮食记录卡片展示。
- 点评请求失败时不影响记录创建成功流程，前端对点评区域做静默降级或错误提示处理。

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `calorie-service`: 新增单条记录点评接口封装与返回契约。
- `home-page-components`: 新增饮食记录卡片点评区域，并在新增饮食记录成功后展示最近一次记录点评。

## Impact

- 受影响前端模块：`src/services/calorieService.ts`、`src/hooks/useCalorieTracker.ts`、`src/components/CalorieRecordList.tsx`。
- 依赖现有后端接口：`POST /calorie/:id/comment`，返回 `{ comment, model }`。
- 需要明确新增流程中的状态管理，包括点评加载、点评内容以及点评失败时的降级行为。