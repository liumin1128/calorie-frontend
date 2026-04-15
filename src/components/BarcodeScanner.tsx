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
interface DetectedBarcode {
  rawValue: string;
  format: string;
}
interface BarcodeDetectorInstance {
  detect: (source: ImageBitmap) => Promise<DetectedBarcode[]>;
}
interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
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

  const [supported, setSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  /* ---- 兼容性检测 ---- */
  useEffect(() => {
    setSupported(
      typeof globalThis !== "undefined" && "BarcodeDetector" in globalThis,
    );
  }, []);

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
      const detector = new (
        globalThis as unknown as { BarcodeDetector: BarcodeDetectorConstructor }
      ).BarcodeDetector();

      const bitmap = await createImageBitmap(file);
      const barcodes = await detector.detect(bitmap);
      bitmap.close();

      if (barcodes.length > 0) {
        const { rawValue, format } = barcodes[0];
        setStatus("success");
        alert(`扫描成功！\n格式: ${format}\n内容: ${rawValue}`);
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
        {/* 不支持提示 */}
        {supported === false && (
          <Alert severity="warning" sx={{ borderRadius: 3 }}>
            当前浏览器不支持条码扫描功能，请使用 Chrome / Edge 浏览器
          </Alert>
        )}

        {/* 主内容 */}
        {supported && (
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
                sx={{ flex: 1, borderRadius: 3 }}
              >
                拍照扫描
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhotoLibraryIcon />}
                onClick={() => albumInputRef.current?.click()}
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
              使用浏览器原生 Barcode Detection API，仅支持 Chromium 内核浏览器
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
