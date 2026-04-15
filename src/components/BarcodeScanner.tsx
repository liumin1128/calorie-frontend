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

/* ---------- 检测策略：原生优先，html5-qrcode 兜底 ---------- */
const hasNativeDetector =
  typeof globalThis !== "undefined" && "BarcodeDetector" in globalThis;

async function detectBarcode(file: File): Promise<ScanResult | null> {
  if (hasNativeDetector) {
    return detectWithNative(file);
  }
  return detectWithFallback(file);
}

async function detectWithNative(file: File): Promise<ScanResult | null> {
  const detector = new (
    globalThis as unknown as { BarcodeDetector: BarcodeDetectorConstructor }
  ).BarcodeDetector();
  const bitmap = await createImageBitmap(file);
  const barcodes = await detector.detect(bitmap);
  bitmap.close();
  if (barcodes.length > 0) {
    return { text: barcodes[0].rawValue, format: barcodes[0].format };
  }
  return null;
}

/**
 * iOS 拍摄的图片带有 EXIF 旋转信息，html5-qrcode 不处理 EXIF 导致识别失败。
 * 通过 Canvas 将图片重绘一遍——浏览器渲染 <img> 时会自动应用 EXIF 旋转，
 * 从而得到方向正确的像素数据，再传给解码器。
 */
async function normalizeOrientation(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.95,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };
    img.src = url;
  });
}

async function detectWithFallback(file: File): Promise<ScanResult | null> {
  // 修正 EXIF 旋转信息（iOS 必须）
  const correctedFile = await normalizeOrientation(file);

  // 动态加载 html5-qrcode，实现分包按需加载
  const { Html5Qrcode } = await import("html5-qrcode");

  // html5-qrcode 需要一个 DOM 容器，创建临时隐藏元素
  const tempId = `__qr_scanner_${Date.now()}`;
  const container = document.createElement("div");
  container.id = tempId;
  container.style.display = "none";
  document.body.appendChild(container);

  try {
    const scanner = new Html5Qrcode(tempId);
    const decodedText = await scanner.scanFile(correctedFile, false);
    return { text: decodedText, format: "qr_code" };
  } catch {
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

  /* ---- 重置状态 ---- */
  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMsg("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  /* ---- Dialog 关闭时重置 ---- */
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  /* ---- 识别图片中的条码 ---- */
  const detectFromFile = useCallback(async (file: File) => {
    setStatus("detecting");
    setErrorMsg("");

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const result = await detectBarcode(file);
      if (result) {
        setStatus("success");
        alert(`扫描成功！\n格式: ${result.format}\n内容: ${result.text}`);
      } else {
        setStatus("not-found");
      }
    } catch {
      setStatus("error");
      setErrorMsg("识别失败，请尝试其他图片");
    }
  }, []);

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
            {hasNativeDetector
              ? "使用浏览器原生 Barcode Detection API"
              : "使用 html5-qrcode 解码引擎"}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
