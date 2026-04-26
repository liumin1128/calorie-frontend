## MODIFIED Requirements

### Requirement: 图片上传区域
新增记录弹层中，当类型为「饮食」时，SHALL 展示一个图片上传区域，用户可点击选择本地图片；该区域的展示 UI 与上传/分析逻辑 SHALL 分离，并支持已保存图片回显。

#### Scenario: 饮食类型显示上传区域
- **WHEN** 用户打开新增记录弹层且类型为「饮食」
- **THEN** 弹层中 SHALL 显示图片上传区域，支持点击上传

#### Scenario: 运动类型隐藏上传区域
- **WHEN** 用户切换类型为「运动」
- **THEN** 图片上传区域 SHALL 隐藏

#### Scenario: 选择图片后显示预览
- **WHEN** 用户通过上传区域选择一张图片
- **THEN** SHALL 显示图片缩略图预览，并出现「分析」按钮

#### Scenario: 编辑已有记录时回显图片
- **WHEN** 用户打开带有 `images` 的饮食记录进行编辑
- **THEN** 图片上传区域 SHALL 回显已保存图片

### Requirement: AI 图片营养分析
用户点击「分析」按钮后，系统 SHALL 调用后端 `POST /gateway/ai/image-nutrition` 接口上传图片并获取营养分析结果；分析使用的图片与记录最终保存使用的图片 SHALL 可在前端统一复用。

#### Scenario: 分析成功并自动填充
- **WHEN** 用户点击「分析」按钮且后端返回成功
- **THEN** SHALL 将分析结果自动填充至表单（食物名称、卡路里字段）

#### Scenario: 分析过程中显示 loading
- **WHEN** 图片正在分析中
- **THEN** SHALL 显示加载状态，「分析」按钮 SHALL 禁用并显示"分析中..."

#### Scenario: 分析失败显示错误
- **WHEN** 后端接口返回错误或网络异常
- **THEN** SHALL 显示错误提示信息，用户仍可手动填写表单

#### Scenario: 分析结果保存时复用同一来源图片
- **WHEN** 用户基于 AI 分析结果继续保存记录
- **THEN** 系统 SHALL 复用当前来源图片进行记录图片上传，而不是要求用户重新选图