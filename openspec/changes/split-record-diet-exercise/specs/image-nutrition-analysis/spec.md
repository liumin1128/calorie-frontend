## MODIFIED Requirements

### Requirement: 图片上传区域
新增记录弹层中，当类型为「饮食」时（无论手动选择还是 lockedType），SHALL 展示一个图片上传区域，用户可点击选择本地图片。ImageUploadAnalyzer 组件 SHALL 支持通过 ref 暴露 `triggerFileSelect()` 方法，允许外部自动触发文件选择。

#### Scenario: 饮食类型显示上传区域
- **WHEN** 用户打开新增记录弹层且类型为「饮食」（手动选择或 lockedType=intake）
- **THEN** 弹层中 SHALL 显示图片上传区域，支持点击上传

#### Scenario: 运动类型隐藏上传区域
- **WHEN** 类型为「运动」（手动选择或 lockedType=burn）
- **THEN** 图片上传区域 SHALL 隐藏

#### Scenario: 选择图片后显示预览
- **WHEN** 用户通过上传区域选择一张图片
- **THEN** SHALL 显示图片缩略图预览，并出现「分析」按钮

#### Scenario: 外部自动触发文件选择
- **WHEN** CreateRecordDialog 以 autoTriggerImage 模式打开
- **THEN** SHALL 在组件挂载后通过 ref 调用 `triggerFileSelect()` 自动打开文件选择器
