## ADDED Requirements

### Requirement: 顶部导航栏全局展示

系统 SHALL 在所有受保护页面（`/`、`/health-advice` 等）顶部展示统一导航栏，包含「首页」和「健康建议」两个导航项，登录/注册页面不显示导航栏。

#### Scenario: 受保护页面显示导航栏

- **WHEN** 已登录用户访问 `/` 或 `/health-advice`
- **THEN** 页面顶部显示包含「首页」和「健康建议」按钮的导航栏

#### Scenario: 登录/注册页面不显示导航栏

- **WHEN** 用户访问 `/login` 或 `/register`
- **THEN** 页面顶部不显示导航栏

### Requirement: 导航项高亮当前页面

系统 SHALL 对当前激活路由的导航项进行视觉高亮，帮助用户感知当前所在位置。

#### Scenario: 首页导航项高亮

- **WHEN** 当前路由为 `/`
- **THEN** 「首页」导航项显示为激活高亮状态，「健康建议」为未激活状态

#### Scenario: 健康建议页导航项高亮

- **WHEN** 当前路由为 `/health-advice`
- **THEN** 「健康建议」导航项显示为激活高亮状态，「首页」为未激活状态

### Requirement: 导航栏提供路由跳转

系统 SHALL 通过点击导航项实现客户端路由跳转，无需整页刷新。

#### Scenario: 点击首页导航项

- **WHEN** 用户点击「首页」导航项
- **THEN** 系统客户端跳转至 `/`，无页面整体刷新

#### Scenario: 点击健康建议导航项

- **WHEN** 用户点击「健康建议」导航项
- **THEN** 系统客户端跳转至 `/health-advice`，无页面整体刷新
