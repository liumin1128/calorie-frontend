## 1. 服务层与类型

- [x] 1.1 在 `src/types` 或 `src/services/calorieService.ts` 中补充单条记录点评响应类型定义。
- [x] 1.2 在 `src/services/calorieService.ts` 新增 `getCalorieEntryComment(token, id)`，封装 `POST /calorie/:id/comment`。
- [x] 1.3 调整 `src/stores/calorieStore.ts` 的 `addEntry` 返回创建后的 `CalorieEntry`，同时保持列表强制刷新逻辑不变。

## 2. 记录流状态编排

- [x] 2.1 在 `src/hooks/useCalorieTracker.ts` 中新增最近一次饮食点评内容与加载状态。
- [x] 2.2 在新增饮食记录成功后基于返回记录 `_id` 异步请求点评；编辑记录和运动记录保持不触发。
- [x] 2.3 在切换日期和发起新的饮食新增前清空旧点评状态，并确保点评失败不影响新增成功流程。

## 3. 饮食记录卡片展示

- [x] 3.1 扩展 `src/components/CalorieRecordList.tsx` 的 props，使其接收最近一次饮食点评和加载状态。
- [x] 3.2 仅在饮食记录卡片中增加内联 Alert 区域，分别处理加载中、成功展示和无内容隐藏三种状态。
- [x] 3.3 保持运动记录卡片、全局错误 Alert 和现有新增入口交互不变。

## 4. 验证

- [x] 4.1 验证新增饮食记录后列表正常刷新，且饮食卡片出现点评 Alert。
- [x] 4.2 验证新增运动记录、编辑已有记录时不会触发点评请求。
- [x] 4.3 验证点评接口失败时，记录仍创建成功、弹窗可正常关闭，页面不会出现主流程报错。