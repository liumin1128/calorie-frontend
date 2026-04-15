"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import type { BarcodeNutritionPreview as BarcodeNutritionPreviewData } from "@/types/calorie";

const mineralLabels: Array<{
  key: keyof NonNullable<BarcodeNutritionPreviewData["minerals"]>;
  label: string;
  unit: string;
}> = [
  { key: "sodium", label: "钠", unit: "mg" },
  { key: "potassium", label: "钾", unit: "mg" },
  { key: "calcium", label: "钙", unit: "mg" },
  { key: "magnesium", label: "镁", unit: "mg" },
  { key: "phosphorus", label: "磷", unit: "mg" },
  { key: "iron", label: "铁", unit: "mg" },
  { key: "zinc", label: "锌", unit: "mg" },
  { key: "manganese", label: "锰", unit: "mg" },
  { key: "copper", label: "铜", unit: "mg" },
  { key: "selenium", label: "硒", unit: "μg" },
  { key: "iodine", label: "碘", unit: "μg" },
  { key: "chromium", label: "铬", unit: "μg" },
  { key: "fluoride", label: "氟", unit: "mg" },
];

interface Props {
  open: boolean;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  preview: BarcodeNutritionPreviewData | null;
  onClose: () => void;
  onRetryScan: () => void;
  onConfirm: () => void | Promise<void>;
}

function formatMetric(value: number | undefined, unit: string) {
  if (value == null) return "--";
  return `${Math.round(value * 10) / 10}${unit}`;
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        px: 2,
        py: 1.5,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: "secondary.light",
            color: "primary.dark",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default function BarcodeNutritionPreview({
  open,
  loading,
  submitting,
  error,
  preview,
  onClose,
  onRetryScan,
  onConfirm,
}: Props) {
  const nutrientItems = [
    { label: "蛋白质", value: preview?.nutrition?.protein, unit: "g" },
    { label: "碳水", value: preview?.nutrition?.carbohydrates, unit: "g" },
    { label: "脂肪", value: preview?.nutrition?.fat, unit: "g" },
    { label: "纤维", value: preview?.nutrition?.fiber, unit: "g" },
  ];

  const mineralItems = mineralLabels
    .map((item) => ({
      ...item,
      value: preview?.minerals?.[item.key],
    }))
    .filter((item) => item.value != null);

  const combinedNutritionItems = [...nutrientItems, ...mineralItems];

  const canConfirm =
    !!preview && typeof preview.calories === "number" && preview.calories >= 0;

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
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
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <QrCodeScannerIcon sx={{ color: "primary.main" }} />
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
          条码营养预览
        </Typography>
        <IconButton size="small" onClick={onClose} disabled={submitting}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        <Stack spacing={2}>
          {loading && (
            <Box
              sx={{
                minHeight: 220,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
              }}
            >
              <Stack spacing={1.5} alignItems="center">
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary">
                  正在根据条码查询商品营养信息...
                </Typography>
              </Stack>
            </Box>
          )}

          {!loading && error && !preview && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && !preview && (
            <Alert severity="info" sx={{ borderRadius: 3 }}>
              暂未获取到可预览的商品信息，请重新扫码。
            </Alert>
          )}

          {preview && (
            <>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                  {error}
                </Alert>
              )}

              {!canConfirm && (
                <Alert severity="warning" sx={{ borderRadius: 3 }}>
                  已查到该商品信息，但外部数据源尚未提供可用热量值，暂时不能直接添加到记录。
                </Alert>
              )}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box
                  sx={{
                    width: { xs: "100%", sm: 160 },
                    minHeight: 160,
                    flexShrink: 0,
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {preview.imageUrl ? (
                    <Box
                      component="img"
                      src={preview.imageUrl}
                      alt={preview.name}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      暂无商品图片
                    </Typography>
                  )}
                </Box>

                <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {preview.name}
                  </Typography>

                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip label={`条码 ${preview.barcode}`} size="small" />
                    {preview.brand && (
                      <Chip label={preview.brand} size="small" />
                    )}
                    {preview.servingText && (
                      <Chip label={preview.servingText} size="small" />
                    )}
                    {preview.nutritionDataPer && (
                      <Chip
                        label={`营养基准 ${preview.nutritionDataPer}`}
                        size="small"
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ wordBreak: "break-word" }}
                  >
                    将以条码来源记录到当日饮食，确认后会直接加入记录列表。
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <MetricCard
                  icon={<LocalFireDepartmentIcon fontSize="small" />}
                  label="热量"
                  value={formatMetric(preview.calories, " kcal")}
                />
                <MetricCard
                  icon={<WaterDropIcon fontSize="small" />}
                  label="水分"
                  value={formatMetric(preview.water, " ml")}
                />
              </Stack>

              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  p: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                >
                  营养成分与微量元素
                </Typography>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {combinedNutritionItems.map((item) => (
                    <Chip
                      key={item.label}
                      label={`${item.label} ${formatMetric(item.value ?? undefined, item.unit)}`}
                      variant="outlined"
                      sx={{ borderRadius: 999 }}
                    />
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button onClick={onClose} disabled={submitting}>
          {preview ? "取消" : "关闭"}
        </Button>
        <Button variant="outlined" onClick={onRetryScan} disabled={submitting}>
          重新扫码
        </Button>
        {preview && (
          <Button
            variant="contained"
            onClick={() => void onConfirm()}
            disabled={!canConfirm || loading || submitting}
          >
            {submitting ? "添加中..." : "添加到记录"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
