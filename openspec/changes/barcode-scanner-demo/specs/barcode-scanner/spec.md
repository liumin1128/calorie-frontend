## ADDED Requirements

### Requirement: 浏览器兼容性检测

系统 SHALL 在页面加载时检测当前浏览器是否支持 `BarcodeDetector` API。若不支持，SHALL 展示明确的不兼容提示信息，不尝试调用摄像头。

#### Scenario: 浏览器支持 BarcodeDetector

- **WHEN** 用户打开扫码页面且浏览器支持 `BarcodeDetector` API
- **THEN** 页面展示摄像头预览区域和扫描控制界面

#### Scenario: 浏览器不支持 BarcodeDetector

- **WHEN** 用户打开扫码页面且浏览器不支持 `BarcodeDetector` API
- **THEN** 页面展示"当前浏览器不支持条码扫描功能，请使用 Chrome/Edge 浏览器"提示，不请求摄像头权限

### Requirement: 摄像头权限获取

系统 SHALL 通过 `navigator.mediaDevices.getUserMedia` 请求后置摄像头（移动端）或默认摄像头（桌面端）权限。

#### Scenario: 用户授权摄像头

- **WHEN** 用户授权摄像头权限
- **THEN** 页面展示摄像头实时预览画面，并开始自动扫描检测

#### Scenario: 用户拒绝摄像头权限

- **WHEN** 用户拒绝摄像头权限
- **THEN** 页面展示"请授权摄像头权限以使用扫码功能"提示信息

#### Scenario: 设备无摄像头

- **WHEN** 设备没有可用摄像头
- **THEN** 页面展示"未检测到摄像头设备"提示信息

### Requirement: 实时条码扫描

系统 SHALL 使用 `BarcodeDetector.detect()` 对摄像头画面进行持续检测，支持 QR Code 和常见一维条码格式。

#### Scenario: 成功扫描到二维码

- **WHEN** 摄像头画面中出现可识别的二维码
- **THEN** 系统通过 `alert()` 弹出识别到的文本内容

#### Scenario: 成功扫描到一维条码

- **WHEN** 摄像头画面中出现可识别的一维条码（如 EAN-13、UPC-A）
- **THEN** 系统通过 `alert()` 弹出识别到的编码内容

#### Scenario: 画面中无可识别码

- **WHEN** 摄像头画面中没有可识别的条码或二维码
- **THEN** 系统继续持续检测，不做任何提示

### Requirement: 资源释放

系统 SHALL 在组件卸载或页面离开时释放摄像头资源。

#### Scenario: 用户离开扫码页面

- **WHEN** 用户导航离开扫码页面
- **THEN** 系统停止所有 MediaStream track，释放摄像头占用

#### Scenario: 组件卸载

- **WHEN** BarcodeScanner 组件被卸载
- **THEN** 系统停止 requestAnimationFrame 循环并释放 MediaStream
