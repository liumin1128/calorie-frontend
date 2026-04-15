"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import type { BarcodeNutritionPreview as BarcodeNutritionPreviewData } from "@/types/calorie";
import { detectBarcodeFromFile, type ScanResult } from "@/lib/barcodeScanner";

/* ---------- 工具函数 ---------- */
function fmt(v: number | undefined, unit: string) {
  if (v == null) return "--";
  return `${Math.round(v * 10) / 10}${unit}`;
}

function canConfirm(preview: BarcodeNutritionPreviewData | null) {
  return (
    !!preview && typeof preview.calories === "number" && preview.calories >= 0
  );
}

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

type Phase = "pick" | "detecting" | "querying" | "preview" | "error";

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
  const cameraRef = useRef<HTMLInputElement>(null);
  const albumRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState("");
  const [detecting, setDetecting] = useState(false);

  /* ---- 推导当前阶段 ---- */
  const phase: Phase = (() => {
    if (preview) return "preview";
    if (detecting) return "detecting";
    if (loading) return "querying";
    if (error || localError) return "error";
    return "pick";
  })();

  /* ---- 关闭时重置 ---- */
  useEffect(() => {
    if (!open) {
      setLocalError("");
      setDetecting(false);
    }
  }, [open]);

  /* ---- 识别条码 ---- */
  const detect = useCallback(
    async (file: File) => {
      setLocalError("");
      setDetecting(true);
      try {
        const result = await detectBarcodeFromFile(file);
        if (!result) {
          setLocalError("未识别到条码，请确保图片中包含清晰的条形码");
          return;
        }
        if (onDetected) await onDetected(result);
      } catch (e) {
        setLocalError(
          e instanceof Error ? e.message : "识别失败，请尝试其他图片",
        );
      } finally {
        setDetecting(false);
      }
    },
    [onDetected],
  );

  const onFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void detect(file);
      e.target.value = "";
    },
    [detect],
  );

  const handleClose = () => {
    setLocalError("");
    onClose();
  };

  const handleRetry = () => {
    setLocalError("");
    setDetecting(false);
    onRetryScan();
  };

  const ok = canConfirm(preview);
  const busy = loading || submitting;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* ── 标题栏 ── */}
      <Stack direction="row" alignItems="center" sx={{ px: 2.5, pt: 2, pb: 1 }}>
        <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
          扫码识别
        </Typography>
        <IconButton size="small" onClick={handleClose} disabled={busy}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* ── 内容区 ── */}
      <Box sx={{ px: 2.5, pb: 1 }}>
        {/* 选图阶段 */}
        {phase === "pick" && (
          <Stack spacing={1.5} sx={{ py: 3 }}>
            <Button
              variant="contained"
              startIcon={<CameraAltIcon />}
              onClick={() => cameraRef.current?.click()}
              sx={{ borderRadius: 3, py: 1.2 }}
              fullWidth
            >
              拍照扫描
            </Button>
            <Button
              variant="outlined"
              startIcon={<PhotoLibraryIcon />}
              onClick={() => albumRef.current?.click()}
              sx={{ borderRadius: 3, py: 1.2 }}
              fullWidth
            >
              相册选图
            </Button>
          </Stack>
        )}

        {/* 加载阶段 */}
        {(phase === "detecting" || phase === "querying") && (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 5 }}>
            <CircularProgress size={28} thickness={4.5} />
            <Typography variant="body2" color="text.secondary">
              {phase === "detecting" ? "识别条码中..." : "查询营养信息..."}
            </Typography>
          </Stack>
        )}

        {/* 错误阶段 */}
        {phase === "error" && (
          <Stack spacing={2} sx={{ py: 2 }}>
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              {error || localError}
            </Alert>
          </Stack>
        )}

        {/* 预览阶段 */}
        {phase === "preview" && preview && (
          <Stack spacing={2} sx={{ py: 1 }}>
            {error && (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            {!ok && (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                该商品缺少热量数据，暂不能添加到记录
              </Alert>
            )}

            {/* 商品信息 */}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {preview.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[preview.brand, preview.barcode, preview.servingText]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            </Box>

            {/* 热量 */}
            <Box
              sx={{
                borderRadius: 3,
                bgcolor: "secondary.light",
                px: 2,
                py: 1.5,
                textAlign: "center",
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "primary.dark", lineHeight: 1.2 }}
              >
                {fmt(preview.calories, "")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                kcal
              </Typography>
            </Box>

            {/* 三大营养素 */}
            <Stack direction="row" spacing={0}>
              {[
                {
                  label: "蛋白质",
                  value: preview.nutrition?.protein,
                  unit: "g",
                },
                {
                  label: "碳水",
                  value: preview.nutrition?.carbohydrates,
                  unit: "g",
                },
                { label: "脂肪", value: preview.nutrition?.fat, unit: "g" },
              ].map((n) => (
                <Box key={n.label} sx={{ flex: 1, textAlign: "center" }}>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {fmt(n.value, "")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {n.label}({n.unit})
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}
      </Box>

      {/* ── 操作栏 ── */}
      <Stack direction="row" spacing={1} sx={{ px: 2.5, pb: 2.5, pt: 1 }}>
        {phase === "error" && (
          <>
            <Button onClick={handleClose} sx={{ flex: 1, borderRadius: 3 }}>
              关闭
            </Button>
            <Button
              variant="outlined"
              onClick={handleRetry}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              重新扫码
            </Button>
          </>
        )}

        {phase === "preview" && (
          <>
            <Button
              onClick={handleRetry}
              disabled={submitting}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              重新扫码
            </Button>
            <Button
              variant="contained"
              onClick={() => void onConfirm()}
              disabled={!ok || submitting}
              sx={{ flex: 1, borderRadius: 3 }}
            >
              {submitting ? "添加中..." : "添加到记录"}
            </Button>
          </>
        )}

        {phase === "pick" && (
          <Button onClick={handleClose} fullWidth sx={{ borderRadius: 3 }}>
            取消
          </Button>
        )}
      </Stack>

      {/* 隐藏的 file input */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        style={{ display: "none" }}
      />
      <input
        ref={albumRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        style={{ display: "none" }}
      />
    </Dialog>
  );
}
