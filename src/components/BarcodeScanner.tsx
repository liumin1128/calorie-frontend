"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import type { BarcodeNutritionPreview as BarcodeNutritionPreviewData } from "@/types/calorie";
import BarcodeLoadingOverlay from "@/components/barcode/BarcodeLoadingOverlay";
import BarcodePickerPanel from "@/components/barcode/BarcodePickerPanel";
import BarcodePreviewPanel, {
  canConfirmBarcodePreview,
} from "@/components/barcode/BarcodePreviewPanel";
import { detectBarcodeFromFile, type ScanResult } from "@/lib/barcodeScanner";

/* ---------- Props ---------- */
interface Props {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  preview: BarcodeNutritionPreviewData | null;
  onClose: () => void;
  onDetected?: (result: ScanResult) => void | Promise<void>;
  onRetryScan: () => void;
  onConfirm: () => void | Promise<void>;
}

/* ---------- 状态类型 ---------- */
type ScanStatus = "idle" | "detecting" | "not-found" | "error";

export default function BarcodeScanner({
  open,
  loading,
  submitting,
  error,
  preview,
  onClose,
  onDetected,
  onRetryScan,
  onConfirm,
}: Props) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<ScanStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!preview?.imageUrl) return;

    let active = true;
    const image = new Image();
    const currentImageUrl = preview.imageUrl;

    image.onload = () => {
      if (!active) return;
      setResolvedImageUrl(currentImageUrl);
    };

    image.onerror = () => {
      if (!active) return;
      setFailedImageUrl(currentImageUrl);
      setResolvedImageUrl(currentImageUrl);
    };

    image.src = currentImageUrl;

    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [preview?.imageUrl]);

  /* ---- 重置状态 ---- */
  const reset = useCallback(() => {
    setStatus("idle");
    setErrorMsg("");
    setResolvedImageUrl(null);
    setFailedImageUrl(null);
  }, []);

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

      try {
        const result = await detectBarcodeFromFile(file);
        if (result) {
          if (onDetected) {
            await onDetected(result);
            setStatus("idle");
          } else {
            setStatus("idle");
            alert(`扫描成功！\n格式: ${result.format}\n内容: ${result.text}`);
          }
        } else {
          setStatus("not-found");
        }
      } catch (error) {
        setStatus("error");
        const detail =
          error instanceof Error ? error.message : "识别失败，请尝试其他图片";
        setErrorMsg(detail);
      }
    },
    [onDetected],
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

  const canConfirm = canConfirmBarcodePreview(preview);
  const imageResolved =
    !preview?.imageUrl || resolvedImageUrl === preview.imageUrl;
  const imageFailed =
    !!preview?.imageUrl && failedImageUrl === preview.imageUrl;
  const waitingForImage = !!preview?.imageUrl && !imageResolved;
  const showPreview = !!preview && !waitingForImage;
  const showPicker = !showPreview && !loading && status === "idle";
  const showQueryError = !preview && !loading && !!error;
  const isBusy = status === "detecting" || loading || waitingForImage;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          },
        },
      }}
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

      <DialogContent
        sx={{
          px: 3,
          pb: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Stack spacing={2} sx={{ minHeight: 260 }}>
          {status === "not-found" && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              未识别到条码，请确保图片中包含清晰的二维码或条形码。
            </Alert>
          )}
          {status === "error" && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {errorMsg}
            </Alert>
          )}
          {showQueryError && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {showPicker && (
            <BarcodePickerPanel
              onPickCamera={() => cameraInputRef.current?.click()}
              onPickAlbum={() => albumInputRef.current?.click()}
            />
          )}

          {showPreview && preview && (
            <BarcodePreviewPanel
              preview={preview}
              error={error}
              imageFailed={imageFailed}
            />
          )}

          {isBusy && !showPreview && <Box sx={{ flex: 1 }} />}

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

          {isBusy && <BarcodeLoadingOverlay />}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 0,
          opacity: isBusy ? 0 : 1,
          pointerEvents: isBusy ? "none" : "auto",
          transition: "opacity 160ms ease",
        }}
      >
        <Button onClick={handleClose} disabled={submitting}>
          {preview ? "取消" : "关闭"}
        </Button>
        <Button variant="outlined" onClick={onRetryScan} disabled={submitting}>
          重新扫码
        </Button>
        {preview && (
          <Button
            variant="contained"
            onClick={() => void onConfirm()}
            disabled={!canConfirm || submitting}
          >
            {submitting ? "添加中..." : "添加到记录"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
