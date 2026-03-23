# Calorie Tracker — 项目全局规格文档

> 单一真理来源 (Single Source of Truth)，供 OpenSpec `/propose` 及后续任务快速建立上下文。

---

## 1. 技术栈概览

| 类别 | 技术 | 版本 / 备注 |
|------|------|-------------|
| 框架 | Next.js (App Router) | 16.1.6 |
| 语言 | TypeScript | ^5，启用 `strict` 模式 |
| UI 库 | MUI (Material UI) v7 | `@mui/material` ^7.3.9 |
| 样式方案 | Emotion (`@emotion/react` + `@emotion/styled`) | ^11.14.x |
| MUI SSR | `@mui/material-nextjs` v16 AppRouter 适配 | ^7.3.9 |
| React | React 19 | 19.2.3 |
| 包管理 | pnpm (workspace) | `pnpm-workspace.yaml` |
| Lint | ESLint 9 + `eslint-config-next` (core-web-vitals + typescript) | flat config |
| 后端 API | 独立后端服务（非本仓库） | 通过 `NEXT_PUBLIC_API_URL` 配置，默认 `http://localhost:3001` |

> **注意**：项目目前未引入状态管理库（如 Zustand/Redux）和数据获取库（如 TanStack Query）。数据管理完全依赖 React 内置的 `useState`，API 调用使用原生 `fetch`。

---

## 2. 目录结构说明

```
src/
├── app/                    # Next.js App Router 路由层
│   ├── layout.tsx          # 根布局：MUI SSR + ThemeRegistry + AuthProvider
│   ├── page.tsx            # 首页（卡路里追踪主界面）
│   ├── globals.css         # 全局 CSS（仅注释，实际由 MUI CssBaseline 管理）
│   ├── login/page.tsx      # 登录页
│   └── register/page.tsx   # 注册页
├── components/             # 可复用 UI 组件（按功能域拆分子文件夹）
│   ├── CreateRecordDialog.tsx  # 新增卡路里记录弹窗
│   ├── ProfileDialog.tsx       # 个人信息设置弹窗
│   └── ThemeRegistry.tsx       # MUI ThemeProvider + CssBaseline 封装
├── contexts/               # React Context 状态管理
│   └── AuthContext.tsx     # 认证上下文（登录/注册/登出/Token 管理）
├── services/               # API 服务层（按业务域拆分文件）
│   └── (按功能域命名，如 authService.ts, calorieService.ts)
├── utils/                  # 全局通用工具方法
│   └── (纯函数工具，如日期格式化、数值计算等)
├── lib/                    # 底层基础设施（HTTP 客户端等）
│   └── api.ts              # 底层 HTTP 请求封装
├── types/                  # TypeScript 类型定义
│   └── calorie.ts          # 业务类型 + 预设数据 + BMR 计算工具
├── middleware.ts           # Next.js 边缘中间件（路由守卫）
└── theme.ts                # MUI 自定义主题配置
```

```
openspec/                   # OpenSpec 框架目录
├── config.yaml             # OpenSpec 配置
├── current_state.md        # 本文件 — 项目全局规格
├── changes/                # 变更记录
│   └── archive/            # 已归档变更
└── specs/                  # 规格文档
```

---

## 3. 架构模式

### 3.1 整体架构

前后端分离架构：
- **前端**（本仓库）：Next.js App Router 纯客户端渲染（所有页面组件均使用 `"use client"`）
- **后端**：独立 REST API 服务，通过环境变量 `NEXT_PUBLIC_API_URL` 配置

### 3.2 数据流向

```
用户操作 → React 组件 (useState) → API 请求 (fetch) → 后端 REST API
                ↑                                           |
                └───────────── JSON 响应 ──────────────────┘
```

- **状态管理**：React `useState` + Context API，无第三方状态库
- **API 调用**：`src/lib/api.ts` 封装了统一的 `request<T>()` 泛型函数，处理请求头、错误解析
- **认证状态**：通过 `AuthContext` 全局提供，Token 同时存于 `localStorage`（客户端）和 `Cookie`（供中间件读取）

### 3.3 路由与导航

| 路由 | 访问控制 | 说明 |
|------|----------|------|
| `/` | 需登录 | 卡路里追踪主页面 |
| `/login` | 公开（已登录重定向到 `/`） | 登录页 |
| `/register` | 公开（已登录重定向到 `/`） | 注册页 |

### 3.4 认证流程

1. **登录/注册** → 请求后端 `/auth/login` 或 `/auth/register`
2. **Token 存储** → `localStorage` + Cookie（`calorie_token`，7 天有效期）
3. **路由守卫** → `middleware.ts` 读取 Cookie 判断登录状态
4. **登出** → 清除 `localStorage` + Cookie → 跳转 `/login`

---

## 4. 编码规范

### 4.1 TypeScript 规范
- **强制 TypeScript**：`strict: true`，所有文件使用 `.ts` / `.tsx`
- **路径别名**：`@/*` 映射到 `./src/*`
- **接口优先**：使用 `interface` 定义数据结构，`type` 用于联合类型

### 4.2 React 规范
- **函数式组件**：100% 使用函数组件 + Hooks，无 class 组件
- **`"use client"` 指令**：所有包含交互逻辑的组件显式标注
- **命名导出**：Context 相关使用命名导出（`useAuth`），页面组件使用默认导出

### 4.3 MUI 使用规范
- **按需导入**：逐个从 `@mui/material/ComponentName` 导入，非桶导入（tree-shaking 友好）
- **`sx` prop 样式**：内联样式优先使用 MUI 的 `sx` prop
- **主题定制**：统一在 `theme.ts` 中配置调色板、排版、组件默认值
- **暖色系设计**：主色 `#ff7a59`（珊瑚橙），辅色 `#2bb9b1`（青绿），背景 `#fff8f3`（暖白）

### 4.4 错误处理
- **API 层**：`request()` 函数统一捕获非 2xx 响应，解析 `body.message` 并抛出 `Error`
- **UI 层**：通过 `useState` 管理错误信息，使用 MUI `Alert` 组件展示
- **模式**：`try/catch` + `finally`（用于 loading 状态复位）

### 4.5 代码组织规范
- **功能分层**：严格按职责分层，禁止跨层混写
  - `services/` — API 服务层：封装所有后端接口调用，按业务域拆分文件（如 `authService.ts`、`calorieService.ts`）
  - `utils/` — 全局工具方法：纯函数、无副作用，可被任意模块复用（如日期格式化、数值计算）
  - `lib/` — 底层基础设施：HTTP 客户端、第三方库封装等
  - `components/` — UI 组件：按功能域组织，复杂功能可建子文件夹
  - `contexts/` — 全局状态：仅放 Context Provider，不混入业务逻辑
  - `types/` — 类型定义：纯类型文件，不含运行时代码（预设数据等应迁至对应 service 或 constants）
- **代码拆分**：单文件职责单一，超过 200 行应考虑拆分；组件内部的工具函数应提取到 `utils/`
- **降低耦合**：
  - 组件不直接调用 `fetch`，通过 `services/` 层间接访问
  - 业务逻辑与 UI 分离，Hooks 封装业务状态，组件只负责渲染
  - 页面级工具函数放在页面同级 `utils/` 或提升到 `src/utils/`
- **局部工具方法**：若工具方法仅服务于某个功能模块，放在该模块目录下的 `utils.ts`；若跨模块复用，提升到 `src/utils/`

### 4.6 代码风格
- **中文 UI**：界面文案全部使用中文
- **ESLint**：使用 flat config（`eslint.config.mjs`），继承 `core-web-vitals` + `typescript`

---

## 5. 核心逻辑点

### 5.1 身份验证 (`AuthContext`)

**文件**：`src/contexts/AuthContext.tsx`

- 提供 `AuthProvider` 包裹整个应用
- 暴露：`user`, `token`, `loading`, `login()`, `register()`, `logout()`
- Token 双重存储策略：
  - `localStorage`：客户端 JS 读取
  - Cookie（`calorie_token`）：中间件路由守卫读取
- 初始化时从 `localStorage` 恢复登录态

### 5.2 路由中间件 (`middleware.ts`)

**文件**：`src/middleware.ts`

- 基于 Cookie 的路由守卫
- 公开路径白名单：`["/login", "/register"]`
- 已登录用户访问公开页 → 重定向到 `/`
- 未登录用户访问受保护页 → 重定向到 `/login`
- `matcher` 排除静态资源和 API 路由

### 5.3 API 请求层 (`api.ts`)

**文件**：`src/lib/api.ts`

- 统一封装 `request<T>(path, options)` 泛型请求函数
- 自动拼接 `API_BASE` 前缀，设置 `Content-Type: application/json`
- 非 2xx 自动解析错误信息并抛出
- 已实现端点：`/auth/register`, `/auth/login`, `/auth/profile`

### 5.4 业务数据模型 (`calorie.ts`)

**文件**：`src/types/calorie.ts`

| 类型 | 说明 |
|------|------|
| `UserProfile` | 用户体征（年龄/身高/体重/性别） |
| `CalorieRecord` | 饮食/运动记录（描述/类型/卡路里/时间） |
| `WeightRecord` | 体重记录（日期/体重） |
| `PresetItem` | 食物/运动预设项 |

- 内含 16 个食物预设 + 11 个运动预设
- `calculateBMR()` 使用 Mifflin-St Jeor 公式计算基础代谢率

### 5.5 当前已知限制

- **数据为模拟数据**：首页的卡路里记录和体重历史目前是硬编码的 mock 数据，未对接后端 CRUD API
- **无数据持久化**：页面刷新后本地修改丢失
- **无服务端渲染**：所有页面均为 `"use client"`，未利用 Next.js Server Component
- **API 请求无 Token 注入**：`api.ts` 中除 `getProfile` 外，其他请求函数未自动携带 Authorization Header
- **无全局错误边界**：缺少 React Error Boundary

---

## 6. 主题与设计系统

- MUI 自定义主题定义在 `src/theme.ts`
- `ThemeRegistry` 组件作为 ThemeProvider 封装层
- SSR 适配使用 `@mui/material-nextjs/v16-appRouter` 的 `AppRouterCacheProvider`
- 设计风格：温暖、圆润（`borderRadius: 16`），弱阴影，半透明磨砂顶栏
