## REMOVED Requirements

### Requirement: 主页展示 AI 健康建议卡片

**Reason**: 健康建议迁移至独立页面 `/health-advice`，主页不再承载该功能，以精简主页内容层级。

**Migration**: AI 健康建议所有功能（触发、加载、展示、错误处理）完整保留在 `/health-advice` 页面中，用户通过顶部导航栏「健康建议」入口访问。
