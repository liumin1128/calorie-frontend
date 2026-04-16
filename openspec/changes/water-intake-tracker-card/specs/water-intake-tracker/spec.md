## ADDED Requirements

### Requirement: 服务层封装今日饮水接口

系统 SHALL 提供饮水服务层方法，使用后端 `GET /water` 和 `PUT /water` 接口读取并覆盖设置指定日期的饮水量，其中首页饮水卡片默认操作今天的数据。

#### Scenario: 读取今日饮水量
- **WHEN** 前端请求今天的饮水数据
- **THEN** 系统向 `GET /water?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` 发起请求
- **THEN** 若后端返回 `data: [{ date, amount }]`，前端使用对应 `amount` 作为当天饮水量；若返回空数组，则视为 `0ml`

#### Scenario: 覆盖设置今日饮水量
- **WHEN** 前端提交新的今日饮水量
- **THEN** 系统向 `PUT /water` 发送 `{ date: "YYYY-MM-DD", amount: <ml> }`
- **THEN** 后端成功后返回最新 `{ date, amount }`，前端以返回值更新状态

#### Scenario: 接口错误向上抛出
- **WHEN** 饮水接口返回错误或网络异常
- **THEN** 服务层抛出 Error，供状态层与 UI 展示错误信息

### Requirement: Zustand 集中管理今日饮水状态

系统 SHALL 提供独立的 Zustand store 管理今日饮水量、加载状态、提交状态与错误信息，组件层不得直接调用饮水服务函数。

#### Scenario: 首次加载今日饮水
- **WHEN** 首页已获得有效 token 且饮水卡片初始化
- **THEN** store 进入 loading 状态并读取今天的饮水量
- **THEN** 请求完成后更新 `amount`，并将 loading 恢复为 false

#### Scenario: 点击杯子后覆盖更新今日饮水
- **WHEN** 用户在饮水卡片点击某一个杯子
- **THEN** store 将今日饮水量更新为该杯所代表的总量（杯序号 × `500ml`）
- **THEN** store 调用设置接口将该总量覆盖保存到后端

#### Scenario: 提交失败回滚状态
- **WHEN** 用户点击杯子后保存请求失败
- **THEN** store 回滚到提交前的饮水量
- **THEN** store 暴露错误信息供界面提示

#### Scenario: 加载或提交中限制重复交互
- **WHEN** store 处于 loading 或 submitting 状态
- **THEN** 饮水卡片的交互控件 SHALL 进入禁用态，避免重复请求

### Requirement: 饮水卡片使用 500ml 杯子作为主交互

系统 SHALL 提供独立饮水卡片，以一杯 `500ml` 的水杯计数器作为今日饮水记录主交互，并展示当前饮水总量与杯数。

#### Scenario: 根据当前饮水量展示杯数和总量
- **WHEN** 今日饮水量为 `1500ml`
- **THEN** 卡片展示总量为 `1500ml`
- **THEN** 卡片展示已喝 `3` 杯，并高亮前 `3` 个杯子

#### Scenario: 点击未满杯子增加饮水量
- **WHEN** 当前已喝 `2` 杯，用户点击第 `3` 个未满杯子
- **THEN** 卡片将前 `3` 个杯子标记为已喝
- **THEN** 今日饮水量更新为 `1500ml`

#### Scenario: 点击已满杯子调整到更低杯数
- **WHEN** 当前已喝 `4` 杯，用户点击第 `2` 个已满杯子
- **THEN** 卡片将仅保留前 `2` 个杯子为已喝状态
- **THEN** 今日饮水量更新为 `1000ml`

#### Scenario: 后端返回非 500 倍数时保留真实毫升文案
- **WHEN** 后端返回今日饮水量为非 `500ml` 倍数
- **THEN** 卡片仍展示真实毫升数值
- **THEN** 杯子高亮数量基于 `amount / 500` 的向下取整结果计算

#### Scenario: 逻辑层与视图层分离
- **WHEN** 饮水模块完成实现
- **THEN** 数据加载与保存逻辑位于 store 或容器层
- **THEN** 杯子计数视图组件仅通过 props 接收状态和回调，不直接调用 API