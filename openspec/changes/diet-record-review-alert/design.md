## Context

当前新增饮食记录流程是 `CreateRecordDialog -> useCalorieTracker.handleSubmitRecord -> calorieStore.addEntry -> calorieService.createCalorieEntry`。创建成功后只会刷新列表，不会基于新建记录继续请求附加信息。

后端已提供 `POST /calorie/:id/comment` 接口，可为单条卡路里记录返回 `{ comment, model }`。前端现有记录列表组件 `CalorieRecordList` 已在卡片层使用 MUI `Alert` 展示错误信息，因此新增点评区域可以复用相同的视觉语义，不需要引入新的交互容器。

本次需求跨越服务层、业务 Hook 和首页记录卡片，且需要明确“新增成功”和“点评失败不阻塞主流程”的边界，因此需要单独的设计说明。

## Goals / Non-Goals

**Goals:**

- 在新增饮食记录成功后，为该条记录异步获取 AI 点评。
- 在首页饮食记录卡片中展示最近一次新增饮食记录的点评结果。
- 保持新增主流程稳定，点评失败不得影响记录保存、列表刷新和弹窗关闭。
- 改动限定在现有服务层、Hook 和记录卡片组件内，不引入新的全局状态模式。

**Non-Goals:**

- 不改动后端接口行为或返回格式。
- 不为历史记录批量补点评，也不在记录行内为每条记录单独展示点评。
- 不将点评结果持久化到本地缓存或 Zustand 全局 store。
- 不在本次变更中展示模型名、重试按钮或 Snackbar 形式的临时提示。

## Decisions

### 1. 点评请求新增到 `calorieService`，并补充独立响应类型

新增 `getCalorieEntryComment(token, id)`，统一调用 `POST /calorie/:id/comment`，返回独立的 `CalorieCommentResponse` 类型。

原因：
- 该请求属于卡路里业务域，放在 `services/calorieService.ts` 与现有 create/update/delete 能力保持一致。
- 组件和 Hook 继续只依赖服务层，不直接访问 `request()`，符合仓库分层约束。

备选方案：
- 复用 `adviceService`：被否决，因为该接口属于单条卡路里记录，不是全局健康建议能力。
- 在 Hook 中直接调用 `request()`：被否决，因为会破坏服务层封装边界。

### 2. 创建记录后由 `useCalorieTracker` 触发点评请求，而不是由 `calorieStore` 触发

`calorieStore.addEntry` 调整为返回创建后的 `CalorieEntry`，但仍负责刷新列表。`useCalorieTracker.handleSubmitRecord` 在“非编辑模式且 type 为 intake”时，拿到返回记录后触发点评请求。

原因：
- store 当前负责记录数据的获取与刷新，不适合承载仅首页饮食卡片使用的瞬时 UI 状态。
- Hook 已经是首页记录流的编排层，最适合组合“创建记录”和“加载点评”两个动作。

备选方案：
- 在 `calorieStore` 中直接保存点评状态：被否决，因为点评状态只服务首页卡片，不值得上升为全局共享数据。
- 在 `CreateRecordDialog` 中请求点评：被否决，因为点评展示位置不在弹窗内，会让弹窗承担页面状态职责。

### 3. 点评请求采用非阻塞串联，记录保存成功后后台加载点评

`handleSubmitRecord` 在新增饮食记录成功后立即完成主流程；点评请求单独更新 `recentIntakeComment` 与 `recentIntakeCommentLoading`，不作为弹窗关闭的前置条件。

原因：
- 用户的主目标是保存记录，点评属于附加反馈，不能拖慢新增完成感知。
- 当前 `CreateRecordDialog` 会等待 `onSubmit` 结束后关闭，如果将点评请求纳入主 promise，会直接拉长关闭时机。

备选方案：
- 等点评成功后再关闭弹窗：被否决，因为会把次级接口故障放大成主流程阻塞。

### 4. 点评状态保存在 `useCalorieTracker` 本地，并在日期切换时清空

新增本地状态，例如：
- `recentIntakeComment: string | null`
- `recentIntakeCommentLoading: boolean`

在以下时机清空状态：
- 切换 `selectedDate`
- 发起新的饮食新增请求前
- 关闭页面或 Hook 重新挂载时自然丢弃

原因：
- 点评只对应“当前页面最近一次新增饮食记录”，不是长期数据。
- 日期切换后继续展示上一日期的点评会造成语义错位。

### 5. 记录列表在饮食卡片顶部增加内联 `Alert` 区，不改动运动卡片

`CalorieRecordList` 通过新增可选 props 接收点评内容与加载态，仅在 intake 卡片中渲染一个内联 `Alert`：
- 加载中：信息态文案，如“正在生成本次饮食点评...”
- 成功：展示点评文本
- 无点评：不占位

原因：
- 点评的语义是对“最新一次饮食新增”的补充说明，放在饮食卡片顶部比 Snackbar 更稳定，也比塞进单条记录行更简单。
- 现有组件已使用 MUI `Alert`，风格与实现都能直接延续。

备选方案：
- 使用 Snackbar：被否决，因为反馈会自动消失，不利于用户回看。
- 渲染到 `CreateRecordDialog` 内：被否决，因为弹窗关闭后用户无法在主页上下文继续看到点评。

## Risks / Trade-offs

- [创建接口无法区分 201 与 200] → 当前 `request()` 只返回响应体，不返回状态码；若后端因 `externalId` 去重返回更新后的 intake 记录，前端仍可能请求点评。首版接受该行为，后续若要严格区分“新增”与“更新”，再扩展请求层返回 meta。
- [点评接口额外增加一次网络请求] → 仅在新增 intake 成功后触发，且采用非阻塞方式，避免影响主流程耗时。
- [日期切换导致点评消失] → 这是有意限制，用于避免跨日期误展示；最近点评不做持久化。
- [点评失败没有强提示] → 以“不打断新增流程”为优先，失败时仅清空或轻量保留错误状态，不升级为全局报错。

## Migration Plan

1. 前端先接入 `POST /calorie/:id/comment` 服务封装和类型定义。
2. 调整 `calorieStore.addEntry` 返回创建结果，同时保持现有列表刷新逻辑不变。
3. 在 `useCalorieTracker` 中编排新增后点评加载，并把状态透传给 `CalorieRecordList`。
4. 在饮食记录卡片增加点评 Alert 展示。
5. 联调验证新增饮食、编辑记录、运动记录和点评失败分支。

回滚策略：
- 回退 `CalorieRecordList` 新 props 和点评 UI。
- 移除 Hook 中的点评状态与调用。
- 保留或移除 service 封装均不会影响现有主流程。

## Open Questions

- 暂无阻塞性问题。默认本期不展示 `model` 字段，只保留文本点评；若产品后续要求展示模型来源，可在不改协议的前提下扩展 UI。 