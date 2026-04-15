## Why

用户希望通过扫描食品包装上的二维码/条形码快速获取食品信息，减少手动输入。本次先以 Demo 形式验证浏览器原生 Barcode Detection API 的可行性，扫描后 alert 弹出识别结果即可。

## What Changes

- 新增二维码/条形码扫描页面，使用浏览器原生 `BarcodeDetector` API
- 页面提供摄像头实时预览画面，自动检测并识别二维码/条形码
- 识别成功后通过 `alert()` 弹出扫描结果
- 提供 API 兼容性检测，不支持时给出友好提示
- 作为独立 Demo 页面，不与现有业务模块耦合

## Capabilities

### New Capabilities

- `barcode-scanner`: 基于浏览器原生 Barcode Detection API 的二维码/条形码扫描功能，包括摄像头调用、实时检测、结果展示

### Modified Capabilities

（无）

## Impact

- 新增路由页面 `src/app/barcode-scanner/page.tsx`
- 新增扫描器组件 `src/components/BarcodeScanner.tsx`
- 无后端 API 依赖，纯前端功能
- 需要用户授权摄像头权限（通过 `navigator.mediaDevices.getUserMedia`）
- Barcode Detection API 目前仅 Chromium 内核浏览器支持（Chrome、Edge、Opera），Safari/Firefox 暂不支持
