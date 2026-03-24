## ADDED Requirements

### Requirement: 登录时自动获取用户完整信息

系统 SHALL 在用户登录成功后自动获取一次完整的用户信息（包括基础资料和最新身高体重），并存储在全局状态中供各组件消费。

#### Scenario: 登录后自动加载用户信息
- **WHEN** 用户登录成功，AuthContext 中 user 和 token 就绪
- **THEN** 系统自动调用 `/user/full-profile` 获取完整用户信息，存入 UserProfileContext

#### Scenario: 获取用户信息失败
- **WHEN** 用户已登录但 `/user/full-profile` 请求失败（网络错误或服务器错误）
- **THEN** 系统保留已有的认证状态，UserProfileContext 中 profile 为 null，不阻断页面正常使用

### Requirement: 手动刷新用户信息

系统 SHALL 提供手动刷新功能，允许用户或组件独立重新获取最新的用户完整信息。

#### Scenario: 手动触发刷新
- **WHEN** 组件调用 `refreshProfile()` 方法
- **THEN** 系统重新请求 `/user/full-profile`，更新 UserProfileContext 中的 profile 数据

#### Scenario: 编辑保存后自动刷新
- **WHEN** 用户在 ProfileDialog 中保存修改成功
- **THEN** 系统自动调用 `refreshProfile()` 以确保展示最新数据

### Requirement: 编辑用户基础资料

系统 SHALL 允许用户通过表单编辑昵称、性别、生日、个性签名，并通过 `/user/profile` 接口提交至后端持久化。

#### Scenario: 成功更新基础资料
- **WHEN** 用户修改昵称/性别/生日/个性签名并点击保存
- **THEN** 系统将变更的字段通过 PUT `/user/profile` 提交到后端，成功后刷新用户信息

#### Scenario: 更新基础资料失败
- **WHEN** 用户提交基础资料但后端返回错误
- **THEN** 系统展示错误提示，表单保留用户输入内容不丢失

### Requirement: 录入身高体重

系统 SHALL 允许用户在 ProfileDialog 中录入身高和体重，通过 `/dynamic-data` 接口追加写入动态数据表。

#### Scenario: 身高体重值发生变化时提交
- **WHEN** 用户修改了身高或体重数值并点击保存
- **THEN** 系统为发生变化的指标分别调用 POST `/dynamic-data`，以 `category` 为 `height` 或 `weight` 追加新记录

#### Scenario: 身高体重值未变化时不提交
- **WHEN** 用户未修改身高和体重数值并点击保存
- **THEN** 系统不调用 `/dynamic-data` 接口，仅提交基础资料变更（如有）

#### Scenario: 身高体重提交失败
- **WHEN** 身高或体重提交到 `/dynamic-data` 失败
- **THEN** 系统展示错误提示，指明哪项指标提交失败

### Requirement: 用户信息全局可用

系统 SHALL 通过 UserProfileContext 将用户完整信息提供给所有需要的组件，包括主页面的 BMR 计算和卡路里统计。

#### Scenario: 主页面使用真实用户数据
- **WHEN** 主页面渲染且 UserProfileContext 中有 profile 数据
- **THEN** 页面使用真实的身高、体重、性别、生日数据计算 BMR，不再使用硬编码模拟数据

#### Scenario: 用户信息未加载时的降级展示
- **WHEN** 主页面渲染但用户信息尚在加载中
- **THEN** BMR 和相关统计区域展示加载状态，不显示错误数据

### Requirement: 服务层 API 封装

系统 SHALL 在 `services/` 层封装用户资料和动态数据的 API 调用，组件不得直接调用 `fetch` 或 `request()`。

#### Scenario: userService 封装用户资料接口
- **WHEN** 需要获取或更新用户资料
- **THEN** 通过 `userService.getFullProfile(token)` 和 `userService.updateProfile(token, data)` 调用

#### Scenario: dynamicDataService 封装动态数据接口
- **WHEN** 需要录入或查询身体指标数据
- **THEN** 通过 `dynamicDataService.create(token, data)` 和 `dynamicDataService.getLatest(token, params)` 调用
