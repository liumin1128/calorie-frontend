"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import CloseIcon from "@mui/icons-material/Close";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import type {
  BarcodeNutritionPreview as BarcodeNutritionPreviewData,
  MineralsInfo,
} from "@/types/calorie";
import { detectBarcodeFromFile, type ScanResult } from "@/lib/barcodeScanner";
import { RECORD_IMAGE_ACCEPT } from "@/services/imagePreprocessService";

/* ---------- 常量 ---------- */
const mineralLabels: {
  key: keyof MineralsInfo;
  label: string;
  unit: string;
}[] = [
  { key: "sodium", label: "钠", unit: "mg" },
  { key: "potassium", label: "钾", unit: "mg" },
  { key: "calcium", label: "钙", unit: "mg" },
  { key: "iron", label: "铁", unit: "mg" },
  { key: "zinc", label: "锌", unit: "mg" },
  { key: "magnesium", label: "镁", unit: "mg" },
  { key: "phosphorus", label: "磷", unit: "mg" },
  { key: "selenium", label: "硒", unit: "μg" },
];

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
  imageUrl?: string | null;
  onClose: () => void;
  onDetected?: (result: ScanResult) => void | Promise<void>;
  onFileSelected?: (file: File) => void | Promise<void>;
  onRetryScan: () => void;
  onConfirm: () => void | Promise<void>;
}

type Phase = "pick" | "detecting" | "querying" | "preview" | "error";

/* ---------- 子组件：核心指标卡片 ---------- */
function HeroMetric({
  icon,
  value,
  unit,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  unit: string;
  label: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        py: 1.5,
        px: 1.5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      <Box sx={{ color: "primary.main", lineHeight: 0 }}>{icon}</Box>
      <Stack direction="row" alignItems="baseline" spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {unit}
        </Typography>
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: "0.7rem" }}
      >
        {label}
      </Typography>
    </Box>
  );
}

/* ---------- 主组件 ---------- */
export default function BarcodeScanner({
  open,
  loading,
  submitting,
  error,
  preview,
  imageUrl,
  onClose,
  onDetected,
  onFileSelected,
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
        await onFileSelected?.(file);
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
    [onDetected, onFileSelected],
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

  /* ---- 营养素条目 ---- */
  const nutrientItems = preview
    ? [
        { label: "蛋白质", value: preview.nutrition?.protein, unit: "g" },
        { label: "碳水", value: preview.nutrition?.carbohydrates, unit: "g" },
        { label: "脂肪", value: preview.nutrition?.fat, unit: "g" },
        { label: "纤维", value: preview.nutrition?.fiber, unit: "g" },
      ].filter((i) => i.value != null)
    : [];

  const mineralItems = preview?.minerals
    ? mineralLabels
        .map((m) => ({ ...m, value: preview.minerals?.[m.key] }))
        .filter((i) => i.value != null)
    : [];

  const hasSecondary = nutrientItems.length > 0 || mineralItems.length > 0;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          },
        },
      }}
    >
      {/* ── 标题栏 ── */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          px: 2.5,
          pt: 2,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
          扫码识别
        </Typography>
        <IconButton size="small" onClick={handleClose} disabled={busy}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* ── 内容区 ── */}
      <Box sx={{ px: 2.5, py: 2 }}>
        {/* 选图阶段 */}
        {phase === "pick" && (
          <Stack spacing={1.5} sx={{ py: 2 }}>
            <Button
              variant="contained"
              startIcon={<CameraAltIcon />}
              onClick={() => cameraRef.current?.click()}
              sx={{ py: 1.2 }}
              fullWidth
            >
              拍照扫描
            </Button>
            <Button
              variant="outlined"
              startIcon={<PhotoLibraryIcon />}
              onClick={() => albumRef.current?.click()}
              sx={{ py: 1.2 }}
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
          <Stack spacing={2} sx={{ py: 1 }}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {error || localError}
            </Alert>
          </Stack>
        )}

        {/* 预览阶段 */}
        {phase === "preview" && preview && (
          <Stack spacing={2}>
            {error && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {!ok && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                该商品缺少热量数据，暂不能添加到记录
              </Alert>
            )}

            {/* 商品名称 + 副信息 */}
            <Box>
              {imageUrl ? (
                <Box
                  component="img"
                  src={imageUrl}
                  alt="扫码图片预览"
                  sx={{
                    width: "100%",
                    height: 132,
                    objectFit: "cover",
                    borderRadius: 2,
                    mb: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
              ) : null}
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 0.25 }}
              >
                {preview.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {[preview.brand, preview.barcode, preview.servingText]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            </Box>

            {/* 核心指标：卡路里 + 水分 */}
            <Stack direction="row" spacing={1.5}>
              <HeroMetric
                icon={<LocalFireDepartmentIcon fontSize="small" />}
                value={fmt(preview.calories, "")}
                unit="kcal"
                label="热量"
              />
              <HeroMetric
                icon={<WaterDropIcon fontSize="small" />}
                value={fmt(preview.water, "")}
                unit="ml"
                label="水分"
              />
            </Stack>

            {/* 次要信息：营养成分 + 微量元素 */}
            {hasSecondary && (
              <>
                <Divider />
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    营养成分
                    {preview.nutritionDataPer
                      ? `（每 ${preview.nutritionDataPer}）`
                      : ""}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={0.75}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    {nutrientItems.map((n) => (
                      <Chip
                        key={n.label}
                        label={`${n.label} ${fmt(n.value, n.unit)}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          height: 24,
                          fontSize: "0.72rem",
                        }}
                      />
                    ))}
                    {mineralItems.map((m) => (
                      <Chip
                        key={m.label}
                        label={`${m.label} ${fmt(m.value, m.unit)}`}
                        size="small"
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          height: 24,
                          fontSize: "0.72rem",
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </Stack>
        )}
      </Box>

      {/* ── 操作栏 ── */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          px: 2.5,
          pb: 2.5,
          pt: 0.5,
          borderTop: phase === "preview" ? "1px solid" : "none",
          borderColor: "divider",
        }}
      >
        {phase === "error" && (
          <>
            <Button onClick={handleClose} sx={{ flex: 1 }}>
              关闭
            </Button>
            <Button variant="outlined" onClick={handleRetry} sx={{ flex: 1 }}>
              重新扫码
            </Button>
          </>
        )}

        {phase === "preview" && (
          <>
            <Button
              onClick={handleRetry}
              disabled={submitting}
              sx={{ flex: 1 }}
            >
              重新扫码
            </Button>
            <Button
              variant="contained"
              onClick={() => void onConfirm()}
              disabled={!ok || submitting}
              sx={{ flex: 1 }}
            >
              {submitting ? "添加中..." : "添加到记录"}
            </Button>
          </>
        )}

        {phase === "pick" && (
          <Button onClick={handleClose} fullWidth>
            取消
          </Button>
        )}
      </Stack>

      {/* 隐藏的 file input */}
      <input
        ref={cameraRef}
        type="file"
        accept={RECORD_IMAGE_ACCEPT}
        capture="environment"
        onChange={onFile}
        style={{ display: "none" }}
      />
      <input
        ref={albumRef}
        type="file"
        accept={RECORD_IMAGE_ACCEPT}
        onChange={onFile}
        style={{ display: "none" }}
      />
    </Dialog>
  );
}
