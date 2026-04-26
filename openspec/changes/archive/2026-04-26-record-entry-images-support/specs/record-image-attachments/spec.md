## ADDED Requirements

### Requirement: 饮食记录图片附件上传与持久化
系统 SHALL 支持在饮食记录创建、编辑与来源图片确认保存时，将选中的图片上传到对象存储并把返回 URL 写入卡路里记录的 `images` 字段。

#### Scenario: 手动饮食记录保存图片
- **WHEN** 用户在新增或编辑饮食记录时选择了本地图片并点击保存
- **THEN** 系统 SHALL 先上传图片并获取可访问 URL
- **THEN** 系统 SHALL 在提交记录 DTO 时将该 URL 写入 `images` 数组

#### Scenario: AI 识图批量记录复用同一图片
- **WHEN** 用户通过 AI 识图识别出多个食物并确认批量保存
- **THEN** 系统 SHALL 仅上传一次来源图片
- **THEN** 系统 SHALL 为本批次每条生成的记录都写入同一张图片 URL 到 `images` 数组

#### Scenario: 条码确认保存附带扫码图片
- **WHEN** 用户上传扫码图片并确认将条码预览保存为记录
- **THEN** 系统 SHALL 将该扫码来源图片上传并把 URL 写入记录的 `images` 数组

### Requirement: 图片附件状态分离
系统 SHALL 将图片附件的选择/预览 UI 与上传/状态管理逻辑分离，以支持手动录入、AI 识图和扫码场景复用。

#### Scenario: UI 组件仅负责展示
- **WHEN** 前端渲染图片附件区域
- **THEN** 展示组件 SHALL 通过 props 接收预览图、错误、loading 与操作回调
- **THEN** 展示组件 SHALL 不直接发起网络请求

#### Scenario: 逻辑层负责上传与状态变更
- **WHEN** 用户选择、替换、清空或保存图片
- **THEN** 逻辑层 SHALL 统一管理本地文件、已保存 URL、上传状态与错误信息

### Requirement: 已保存图片展示与回显
当记录存在 `images` 字段时，系统 SHALL 在记录列表与编辑界面展示已保存图片。

#### Scenario: 列表展示缩略图
- **WHEN** 某条记录包含至少一个图片 URL
- **THEN** 记录列表 SHALL 显示首张图片缩略图作为回显

#### Scenario: 编辑弹窗回显远端图片
- **WHEN** 用户打开带有 `images` 的记录进行编辑
- **THEN** 编辑界面 SHALL 展示已保存图片预览
- **THEN** 用户 SHALL 能够保留、替换或移除该图片

#### Scenario: 无图片记录保持兼容
- **WHEN** 某条记录没有 `images` 字段或数组为空
- **THEN** 记录列表与编辑界面 SHALL 保持现有布局可用，不显示空白占位错误