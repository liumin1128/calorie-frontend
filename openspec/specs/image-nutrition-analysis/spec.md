## ADDED Requirements

### Requirement: 图片上传区域
新增记录弹层中，当类型为「饮食」时，SHALL 展示一个图片上传区域，用户可点击选择本地图片。

#### Scenario: 饮食类型显示上传区域
- **WHEN** 用户打开新增记录弹层且类型为「饮食」
- **THEN** 弹层中 SHALL 显示图片上传区域，支持点击上传

#### Scenario: 运动类型隐藏上传区域
- **WHEN** 用户切换类型为「运动」
- **THEN** 图片上传区域 SHALL 隐藏

#### Scenario: 选择图片后显示预览
- **WHEN** 用户通过上传区域选择一张图片
- **THEN** SHALL 显示图片缩略图预览，并出现「分析」按钮

### Requirement: 图片格式与大小校验
系统 SHALL 限制上传图片格式为 JPEG、PNG、WebP、GIF，文件大小不超过 5MB。

#### Scenario: 上传不支持的格式
- **WHEN** 用户选择非图片文件或不支持的图片格式
- **THEN** SHALL 提示"仅支持 JPEG、PNG、WebP、GIF 格式"

#### Scenario: 上传超大文件
- **WHEN** 用户选择超过 5MB 的图片
- **THEN** SHALL 提示"图片大小不能超过 5MB"

### Requirement: AI 图片营养分析
用户点击「分析」按钮后，系统 SHALL 调用后端 `POST /gateway/ai/image-nutrition` 接口上传图片并获取营养分析结果。

#### Scenario: 分析成功并自动填充
- **WHEN** 用户点击「分析」按钮且后端返回成功
- **THEN** SHALL 将分析结果自动填充至表单（食物名称、卡路里字段）

#### Scenario: 分析过程中显示 loading
- **WHEN** 图片正在分析中
- **THEN** SHALL 显示加载状态，「分析」按钮 SHALL 禁用并显示"分析中..."

#### Scenario: 分析失败显示错误
- **WHEN** 后端接口返回错误或网络异常
- **THEN** SHALL 显示错误提示信息，用户仍可手动填写表单

### Requirement: 多食物结果合并
当 AI 返回多个食物项时，系统 SHALL 自动合并结果填入表单，并展示各食物明细。

#### Scenario: 返回多个食物项
- **WHEN** AI 分析返回 foods 数组包含多个食物项
- **THEN** SHALL 将所有食物名称拼接填入名称字段，卡路里求和填入卡路里字段
- **AND** SHALL 在表单下方展示各食物项的名称和卡路里明细

#### Scenario: 返回单个食物项
- **WHEN** AI 分析返回 foods 数组仅包含一个食物项
- **THEN** SHALL 直接将该食物的名称和卡路里填入对应字段

### Requirement: 清除已上传图片
用户 SHALL 能够清除已上传的图片和分析结果，恢复手动输入状态。

#### Scenario: 点击清除
- **WHEN** 用户点击图片预览上的清除按钮
- **THEN** SHALL 移除图片预览、隐藏分析结果明细，表单字段不自动清空（保留用户可能的手动修改）

### Requirement: 图片分析服务封装
系统 SHALL 在 `services/imageAnalysisService.ts` 中封装图片分析 API 调用，使用 FormData 上传图片。

#### Scenario: 服务调用携带认证
- **WHEN** 调用图片分析服务
- **THEN** SHALL 在请求头中携带 JWT Bearer Token

#### Scenario: 服务返回结构化数据
- **WHEN** 后端正常响应
- **THEN** 服务 SHALL 返回包含 `foods` 数组和 `summary` 字段的结构化响应
