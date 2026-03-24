## Context

当前前端卡路里追踪应用中，用户个人信息（性别、年龄、身高、体重）使用硬编码的 `initialProfile` 和 `initialWeightHistory` 模拟数据。后端已实现完整的用户资料管理（`/user/profile`、`/user/full-profile`）和身体指标时序数据（`/dynamic-data`）接口。前端需要完成对接，使用户信息真正持久化。

现有架构：
- `AuthContext` 管理 token 和基础用户信息（id、email、nickname）
- `ProfileDialog` 组件已有表单 UI，但数据仅存于本地 state
- `calorieService` 展示了标准的 service 层封装模式可供参考

## Goals / Non-Goals

**Goals:**
- 登录时自动获取一次完整用户信息（含最新身高体重），存入全局 Context
- 提供手动刷新能力，可独立重新获取用户信息
- 基础资料（昵称、性别、生日、个性签名）通过表单直接提交到 `/user/profile`
- 身高体重通过 `/dynamic-data` 写入动态数据表，支持追加式记录
- 替换主页面所有本地模拟的用户数据

**Non-Goals:**
- 身高/体重历史趋势图表展示（后续迭代）
- 用户头像上传
- 密码修改功能
- 后端 API 的修改（后端接口已就绪）

## Decisions

### 1. 新建 UserProfileContext 而非扩展 AuthContext

**选择**：创建独立的 `UserProfileContext` 管理用户详细信息  
**替代方案**：在 `AuthContext` 中扩展用户信息字段  
**理由**：
- `AuthContext` 职责是认证（登录/登出/token），保持单一职责
- 用户信息刷新频率与认证状态不同，分离后互不影响
- `UserProfileContext` 内部依赖 `AuthContext` 的 token 和登录状态

### 2. 服务层按后端域拆分

**选择**：新建 `userService.ts` 和 `dynamicDataService.ts` 两个独立服务文件  
**替代方案**：合并为一个 `profileService.ts`  
**理由**：
- 对应后端两个独立模块（`/user/*` 和 `/dynamic-data/*`），保持一对一映射
- `dynamicDataService` 后续可被其他模块复用（如记录其他身体指标）
- 符合项目 `services/` 按业务域拆分的约定

### 3. 用户信息加载时机

**选择**：`UserProfileContext` 在 `AuthContext.user` 变化时自动加载（`useEffect` 监听），同时暴露 `refreshProfile()` 方法  
**替代方案**：仅在需要时手动调用加载  
**理由**：
- 登录后自动加载，用户无感知
- `refreshProfile()` 支持编辑保存后和手动刷新场景
- 简化组件侧消费逻辑，直接从 Context 读取即可

### 4. 身高体重的提交策略

**选择**：身高体重通过 `/dynamic-data` POST 追加新记录，而非更新  
**理由**：
- 后端 `dynamic-data` 设计为时序追加模式，每次记录都保留历史
- 用户编辑身高体重时，如果值有变化才提交新记录
- 提交后刷新 Context 以获取最新数据

### 5. 类型定义独立文件

**选择**：新建 `src/types/user.ts` 存放用户相关类型  
**替代方案**：放入 `calorie.ts` 中  
**理由**：
- 用户信息与卡路里是不同业务域
- 符合 `types/` 按域拆分的项目约定

## Risks / Trade-offs

- **[Context 嵌套层级增加]** → UserProfileContext 嵌套在 AuthContext 内部，增加一层 Provider。风险可控，仅增加一层。
- **[登录后的额外请求]** → 登录成功后需额外调用 `/user/full-profile`。由于是异步并行，不影响页面渲染首屏。
- **[身高体重与基础信息分两个接口]** → 用户保存时可能需要调用两个 API（`/user/profile` + `/dynamic-data`）。通过 `Promise.all` 并行提交，失败时分别提示。
