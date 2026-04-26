## ADDED Requirements

### Requirement: 获取单条卡路里记录点评
`calorieService` SHALL 提供获取单条卡路里记录点评的服务函数，调用后端 `POST /calorie/:id/comment` 并返回点评结果。

#### Scenario: 成功获取记录点评
- **WHEN** 调用 `getCalorieEntryComment(token, "entry-123")`
- **THEN** 系统 SHALL 向 `/calorie/entry-123/comment` 发送 POST 请求并携带 JWT
- **THEN** 系统 SHALL 返回包含 `comment` 和 `model` 字段的响应对象

#### Scenario: 点评接口失败时抛出错误
- **WHEN** 点评接口返回非 2xx 或网络请求失败
- **THEN** 服务函数 SHALL 抛出 Error 供调用方决定是否降级展示