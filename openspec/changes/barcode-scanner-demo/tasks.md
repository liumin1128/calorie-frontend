## 1. 路由与权限配置

- [x] 1.1 在 `src/middleware.ts` 的 `PUBLIC_PATHS` 中添加 `/barcode-scanner`，使该页面无需登录即可访问

## 2. BarcodeScanner 组件开发

- [x] 2.1 创建 `src/components/BarcodeScanner.tsx` 客户端组件， 实现以下功能：
  - 检测 `BarcodeDetector` API 兼容性
  - 不支持时展示友好提示（引导使用 Chrome/Edge）
  - 调用 `getUserMedia` 获取摄像头（优先后置）
  - 处理权限拒绝和无摄像头等异常情况
  - `<video>` 元素展示实时预览画面
  - `requestAnimationFrame` 循环调用 `BarcodeDetector.detect()` 进行持续检测
  - 检测到条码/二维码时通过 `alert()` 弹出结果
  - 组件卸载时停止 MediaStream track 和 RAF 循环

## 3. 页面路由

- [x] 3.1 创建 `src/app/barcode-scanner/page.tsx` 页面，引入 BarcodeScanner 组件，使用 MUI 布局和项目设计系统风格
