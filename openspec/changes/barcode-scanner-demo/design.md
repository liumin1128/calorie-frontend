## Context

CaloTrack 是一个卡路里追踪应用，用户需要频繁录入食品信息。当前录入方式为手动输入或图片识别。本次新增二维码/条形码扫描作为 Demo 验证，使用浏览器原生 Barcode Detection API，不引入第三方扫码库。

项目技术栈：Next.js 16 (App Router) + React 19 + TypeScript 5 + MUI v7。

## Goals / Non-Goals

**Goals:**

- 验证浏览器原生 Barcode Detection API 的可行性
- 实现摄像头实时预览 + 自动扫码识别
- 扫描成功后 alert 弹出结果
- API 不支持时给出友好降级提示

**Non-Goals:**

- 不对接后端 API 查询食品信息
- 不集成到现有记录流程中
- 不实现图片文件选择扫码（仅摄像头实时扫描）
- 不引入 polyfill 或第三方条码库

## Decisions

### 1. 使用原生 Barcode Detection API 而非第三方库

**选择**: `BarcodeDetector` (Web API)

**理由**: Demo 目的是验证原生 API 可行性，不需要第三方库的兼容性兜底。原生 API 零依赖、性能最优。

**替代方案**: `zxing-js`、`quagga2` 等第三方库兼容性更好，但会引入额外依赖，不符合本次验证目的。

### 2. 组件结构

**选择**: 单个 `BarcodeScanner` 客户端组件 + 页面路由

- `src/components/BarcodeScanner.tsx` — 核心扫描组件（`"use client"`）
- `src/app/barcode-scanner/page.tsx` — 页面入口

**理由**: Demo 功能单一，不需要过度拆分。扫描逻辑和 UI 放在同一个组件中即可。

### 3. 摄像头管理方式

**选择**: `navigator.mediaDevices.getUserMedia` + `<video>` 元素 + `requestAnimationFrame` 循环检测

**理由**: 标准的摄像头调用方式，配合 `BarcodeDetector.detect(videoElement)` 实现实时扫描。使用 `requestAnimationFrame` 而非 `setInterval`，帧率自适应且性能更好。

### 4. 页面路由不需要鉴权

**选择**: Demo 页面为公开路由，不走 middleware 鉴权。

**理由**: 纯前端 Demo，无业务数据，无需登录。需确认 middleware.ts 的路由匹配规则不会拦截该路径。

## Risks / Trade-offs

- **[兼容性受限]** → Barcode Detection API 仅 Chromium 内核支持，页面需检测 `'BarcodeDetector' in window` 并在不支持时展示明确提示
- **[摄像头权限拒绝]** → 用户可能拒绝授权，需 catch `getUserMedia` 错误并展示引导信息
- **[移动端体验]** → 手机浏览器需 HTTPS 才能调用摄像头，本地开发可用 localhost
- **[资源释放]** → 组件卸载时必须停止 MediaStream 所有 track，避免摄像头指示灯常亮
