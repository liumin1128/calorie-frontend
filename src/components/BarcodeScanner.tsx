"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

/* ---------- BarcodeDetector 类型声明（实验性 API） ---------- */
interface BarcodeDetectorInstance {
  detect: (
    source: ImageBitmap,
  ) => Promise<{ rawValue: string; format: string }[]>;
}
interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
}

/* ---------- 统一的扫描结果 ---------- */
interface ScanResult {
  text: string;
  format: string;
}

interface DebugEntry {
  step: string;
  status: "info" | "success" | "warning" | "error";
  detail: string;
}

type TraceFn = (entry: DebugEntry) => void;

/* ---------- 检测策略：原生优先，html5-qrcode 兜底 ---------- */

function checkNativeDetector(): boolean {
  return typeof globalThis !== "undefined" && "BarcodeDetector" in globalThis;
}

async function detectBarcode(
  file: File,
  trace: TraceFn,
): Promise<ScanResult | null> {
  trace({
    step: "文件检查",
    status: "info",
    detail: `${file.name} | ${file.type || "unknown"} | ${Math.round(file.size / 1024)}KB`,
  });

  // 级联策略：先尝试原生 API，不可用或失败时 fallback 到 html5-qrcode
  if (checkNativeDetector()) {
    trace({
      step: "引擎选择",
      status: "info",
      detail: "检测到 BarcodeDetector，先尝试原生引擎",
    });
    const result = await detectWithNative(file, trace);
    if (result) return result;
    trace({
      step: "引擎切换",
      status: "warning",
      detail: "原生引擎未识别到结果，继续尝试 html5-qrcode",
    });
  } else {
    trace({
      step: "引擎选择",
      status: "warning",
      detail: "当前浏览器不支持 BarcodeDetector，直接使用 html5-qrcode",
    });
  }
  return detectWithFallback(file, trace);
}

async function detectWithNative(
  file: File,
  trace: TraceFn,
): Promise<ScanResult | null> {
  try {
    const detector = new (
      globalThis as unknown as { BarcodeDetector: BarcodeDetectorConstructor }
    ).BarcodeDetector();
    trace({
      step: "原生引擎",
      status: "info",
      detail: "BarcodeDetector 实例创建成功",
    });

    const bitmap = await createImageBitmap(file);
    trace({
      step: "原生引擎",
      status: "info",
      detail: `createImageBitmap 成功: ${bitmap.width}x${bitmap.height}`,
    });

    const barcodes = await detector.detect(bitmap);
    bitmap.close();
    trace({
      step: "原生引擎",
      status: barcodes.length > 0 ? "success" : "warning",
      detail: `检测完成，结果数量: ${barcodes.length}`,
    });

    if (barcodes.length > 0) {
      return { text: barcodes[0].rawValue, format: barcodes[0].format };
    }
    return null;
  } catch (error) {
    trace({
      step: "原生引擎",
      status: "error",
      detail: error instanceof Error ? error.message : "未知原生识别错误",
    });
    return null;
  }
}

/**
 * iOS 拍摄的图片存在两个问题：
 * 1. 带有 EXIF 旋转信息，html5-qrcode 不处理 EXIF 导致识别失败
 * 2. 分辨率极高（12~48MP），iOS Canvas 处理超大图片会受内存限制而静默失败
 *
 * 解决方案：通过 Canvas 重绘时同时限制最大边长，浏览器渲染 <img> 会自动
 * 应用 EXIF 旋转，Canvas 导出的数据方向正确且尺寸合理。
 */
const MAX_DIM = 1920;

async function normalizeOrientation(file: File, trace: TraceFn): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);

      trace({
        step: "图片加载",
        status: "info",
        detail: `原图尺寸: ${img.naturalWidth}x${img.naturalHeight}`,
      });

      // 等比缩放，长边不超过 MAX_DIM
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > MAX_DIM || h > MAX_DIM) {
        const scale = MAX_DIM / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
        trace({
          step: "图片缩放",
          status: "info",
          detail: `缩放后尺寸: ${w}x${h}`,
        });
      } else {
        trace({
          step: "图片缩放",
          status: "info",
          detail: "尺寸无需缩放",
        });
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        trace({
          step: "Canvas",
          status: "error",
          detail: "无法获取 2D context，回退使用原始文件",
        });
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            trace({
              step: "Canvas",
              status: "error",
              detail: "toBlob 返回空值，回退使用原始文件",
            });
            resolve(file);
            return;
          }
          trace({
            step: "Canvas",
            status: "success",
            detail: `重绘成功，输出 ${(blob.size / 1024).toFixed(0)}KB JPEG`,
          });
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.92,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      trace({
        step: "图片加载",
        status: "error",
        detail: "浏览器无法加载该图片文件，可能是 HEIC/HEIF 或文件损坏",
      });
      reject(new Error("图片加载失败"));
    };
    img.src = url;
  });
}

async function detectWithFallback(
  file: File,
  trace: TraceFn,
): Promise<ScanResult | null> {
  // 修正 EXIF 旋转信息（iOS 必须）
  const correctedFile = await normalizeOrientation(file, trace);

  // 动态加载 html5-qrcode，实现分包按需加载
  trace({
    step: "Fallback 引擎",
    status: "info",
    detail: "开始动态加载 html5-qrcode",
  });
  const { Html5Qrcode } = await import("html5-qrcode");
  trace({
    step: "Fallback 引擎",
    status: "success",
    detail: "html5-qrcode 动态加载成功",
  });

  // html5-qrcode 内部通过 element.clientWidth 计算 canvas 尺寸，
  // 如果容器是 display:none 则 clientWidth=0，图片会被降采样到 300px，
  // 导致二维码像素被严重压缩，ZXing 无法识别。
  // 必须使用 visibility:hidden + 足够大尺寸 + 离屏定位。
  const tempId = `__qr_scanner_${Date.now()}`;
  const container = document.createElement("div");
  container.id = tempId;
  Object.assign(container.style, {
    position: "fixed",
    left: "-9999px",
    top: "-9999px",
    width: "1920px",
    height: "1920px",
    visibility: "hidden",
    overflow: "hidden",
  });
  document.body.appendChild(container);
  trace({
    step: "Fallback 容器",
    status: "info",
    detail: `容器尺寸 ${container.style.width} x ${container.style.height}`,
  });

  try {
    const scanner = new Html5Qrcode(tempId);
    trace({
      step: "Fallback 引擎",
      status: "info",
      detail: `开始 scanFile，输入 ${correctedFile.type || "unknown"} | ${Math.round(correctedFile.size / 1024)}KB`,
    });
    const decodedText = await scanner.scanFile(correctedFile, false);
    trace({
      step: "Fallback 引擎",
      status: "success",
      detail: "html5-qrcode 识别成功",
    });
    return { text: decodedText, format: "qr_code" };
  } catch (error) {
    trace({
      step: "Fallback 引擎",
      status: "error",
      detail: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    container.remove();
  }
}

/* ---------- Props ---------- */
interface Props {
  open: boolean;
  onClose: () => void;
}

/* ---------- 状态类型 ---------- */
type ScanStatus = "idle" | "detecting" | "success" | "not-found" | "error";

export default function BarcodeScanner({ open, onClose }: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [debugEntries, setDebugEntries] = useState<DebugEntry[]>([]);

  const appendDebug = useCallback((entry: DebugEntry) => {
    setDebugEntries((prev) => [...prev, entry]);
  }, []);

  /* ---- 重置状态 ---- */
  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMsg("");
    setDebugEntries([]);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  /* ---- Dialog 关闭时重置 ---- */
  useEffect(() => {
    if (!open) {
      // 使用微任务避免在 effect 体内同步调用 setState
      const id = setTimeout(reset, 0);
      return () => clearTimeout(id);
    }
  }, [open, reset]);

  /* ---- 识别图片中的条码 ---- */
  const detectFromFile = useCallback(
    async (file: File) => {
      setStatus("detecting");
      setErrorMsg("");
      setDebugEntries([]);

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      appendDebug({
        step: "环境信息",
        status: "info",
        detail: navigator.userAgent,
      });

      try {
        const result = await detectBarcode(file, appendDebug);
        if (result) {
          setStatus("success");
          appendDebug({
            step: "最终结果",
            status: "success",
            detail: `识别成功: ${result.format} | ${result.text}`,
          });
          alert(`扫描成功！\n格式: ${result.format}\n内容: ${result.text}`);
        } else {
          setStatus("not-found");
          appendDebug({
            step: "最终结果",
            status: "warning",
            detail: "所有引擎都未识别到有效码值",
          });
        }
      } catch (error) {
        setStatus("error");
        const detail =
          error instanceof Error ? error.message : "识别失败，请尝试其他图片";
        setErrorMsg(detail);
        appendDebug({
          step: "最终结果",
          status: "error",
          detail,
        });
      }
    },
    [appendDebug],
  );

  /* ---- 文件选择处理 ---- */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) detectFromFile(file);
      e.target.value = "";
    },
    [detectFromFile],
  );

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}
      >
        <QrCodeScannerIcon sx={{ color: "primary.main" }} />
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
          扫码识别
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.5,
          }}
        >
          {/* 图片预览区域 */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              minHeight: 200,
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "grey.100",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewUrl ? (
              <Box
                component="img"
                src={previewUrl}
                alt="扫描图片"
                sx={{
                  width: "100%",
                  maxHeight: 360,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <QrCodeScannerIcon
                  sx={{ fontSize: 56, color: "text.disabled", mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  拍照或选择图片识别条码
                </Typography>
              </Box>
            )}

            {/* 识别中遮罩 */}
            {status === "detecting" && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(0,0,0,0.4)",
                  borderRadius: 3,
                }}
              >
                <CircularProgress sx={{ color: "primary.light" }} />
              </Box>
            )}
          </Box>

          {/* 识别结果提示 */}
          {status === "not-found" && (
            <Alert severity="info" sx={{ width: "100%", borderRadius: 3 }}>
              未识别到条码，请确保图片中包含清晰的二维码或条形码
            </Alert>
          )}
          {status === "error" && (
            <Alert severity="error" sx={{ width: "100%", borderRadius: 3 }}>
              {errorMsg}
            </Alert>
          )}

          {debugEntries.length > 0 && (
            <Box
              sx={{
                width: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                p: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                调试信息
              </Typography>
              <Stack spacing={1}>
                {debugEntries.map((entry, index) => (
                  <Box key={`${entry.step}-${index}`}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {index + 1}. {entry.step}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color:
                          entry.status === "error"
                            ? "error.main"
                            : entry.status === "warning"
                              ? "warning.main"
                              : entry.status === "success"
                                ? "success.main"
                                : "text.secondary",
                        wordBreak: "break-word",
                      }}
                    >
                      {entry.detail}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* 操作按钮 */}
          <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
            <Button
              variant="contained"
              startIcon={<CameraAltIcon />}
              onClick={() => cameraInputRef.current?.click()}
              disabled={status === "detecting"}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              拍照扫描
            </Button>
            <Button
              variant="outlined"
              startIcon={<PhotoLibraryIcon />}
              onClick={() => albumInputRef.current?.click()}
              disabled={status === "detecting"}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              相册选图
            </Button>
          </Stack>

          {/* 隐藏的 file input */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <input
            ref={albumInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          {/* 底部说明 */}
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", textAlign: "center" }}
          >
            支持二维码和常见条形码格式
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
