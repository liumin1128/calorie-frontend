## Why

../backend 已经提供今日饮水的查询与覆盖设置能力，但前端首页仍缺少快捷、直观的饮水记录入口。用户现在可以记录卡路里，却不能用低成本交互完成喝水打卡，这会削弱首页作为日常健康记录入口的完整性。

## What Changes

- 新增饮水服务层，封装后端 `GET /water` 与 `PUT /water`，以今日日期读取和覆盖更新饮水量
- 新增基于 Zustand 的今日饮水状态管理，集中处理加载、提交、错误和回滚逻辑
- 新增独立饮水卡片，将逻辑控制与 UI 视图拆分，并使用每杯 `500ml` 的杯状计数器作为主交互
- 在首页右侧区域接入饮水卡片，与现有个人摘要和日历卡片并列展示

## Capabilities

### New Capabilities
- `water-intake-tracker`: 今日饮水读取、覆盖设置、集中状态管理，以及基于 500ml 水杯的独立记录卡片

### Modified Capabilities
- `home-page-components`: 首页新增独立饮水记录卡片区域，并接入今日饮水数据展示与交互入口

## Impact

- **API**: 对接已存在的后端饮水接口 `GET /water` 与 `PUT /water`
- **类型**: 新增饮水领域类型定义，描述今日饮水查询结果与设置载荷
- **服务**: `services/` 新增饮水服务封装，沿用 `lib/api.ts` 请求客户端
- **状态**: `stores/` 新增今日饮水 Zustand store，统一管理加载与提交状态
- **组件**: `components/` 新增独立饮水卡片与杯子计数视图组件
- **页面**: `app/page.tsx` 首页右栏新增饮水卡片布局
- **依赖**: 复用现有 Next.js、MUI、Zustand、dayjs，无需新增依赖