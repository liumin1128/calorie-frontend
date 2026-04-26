"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import dayjs from "dayjs";
import type {
  CalorieType,
  CalorieEntry,
  CreateCalorieEntryDto,
  PresetItem,
  NutritionInfo,
  MineralsInfo,
  MealType,
} from "@/types/calorie";
import {
  foodPresets,
  exercisePresets,
  mealTypeLabels,
  getDefaultMealType,
} from "@/types/calorie";
import { mineralLabels } from "@/utils/calorie";
import { useAuth } from "@/contexts/AuthContext";
import ImageUploadAnalyzer from "@/components/ImageUploadAnalyzer";
import type { ImageUploadAnalyzerRef } from "@/components/ImageUploadAnalyzer";

const SlideUp = forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCalorieEntryDto) => void | Promise<void>;
  initialData?: CalorieEntry | null;
  defaultDate?: string;
  lockedType?: CalorieType | null;
  autoTriggerImage?: boolean;
}

type NumericFieldValue = number | "";

function parseNumericFieldValue(value: string): NumericFieldValue {
  return value === "" ? "" : Number(value);
}

function getToday() {
  return dayjs().format("YYYY-MM-DD");
}

function getNowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function CreateRecordDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  defaultDate,
  lockedType,
  autoTriggerImage,
}: Props) {
  const isEdit = !!initialData;
  const { token } = useAuth();

  // 直接从 props 初始化 state，确保 Dialog 重新挂载时首帧即正确
  const [type, setType] = useState<CalorieType>(initialData?.type ?? "intake");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [calories, setCalories] = useState<NumericFieldValue>(
    initialData?.calories ?? 0,
  );
  const [date, setDate] = useState(() =>
    initialData
      ? dayjs(initialData.entryDate).format("YYYY-MM-DD")
      : (defaultDate ?? getToday()),
  );
  const [time, setTime] = useState(() => {
    if (initialData) {
      const dt = new Date(initialData.entryDate);
      return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    }
    return getNowTime();
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const imageAnalyzerRef = useRef<ImageUploadAnalyzerRef>(null);

  // 营养信息状态 — 从 initialData 初始化
  const [protein, setProtein] = useState<number | "">(
    initialData?.nutrition?.protein ?? "",
  );
  const [carbohydrates, setCarbohydrates] = useState<number | "">(
    initialData?.nutrition?.carbohydrates ?? "",
  );
  const [fat, setFat] = useState<number | "">(
    initialData?.nutrition?.fat ?? "",
  );
  const [fiber, setFiber] = useState<number | "">(
    initialData?.nutrition?.fiber ?? "",
  );
  const [water, setWater] = useState<number | "">(initialData?.water ?? "");
  const [mealType, setMealType] = useState<MealType>(
    initialData?.mealType ?? getDefaultMealType,
  );
  const [duration, setDuration] = useState<number | "">(
    initialData?.duration ?? "",
  );

  const effectiveType = lockedType ?? type;
  const presets = effectiveType === "intake" ? foodPresets : exercisePresets;
  const isBarcode = initialData?.source === "barcode";
  const isReadonlyNutrition = isBarcode || initialData?.source === "healthkit";

  const handleReset = useCallback(() => {
    setType(lockedType ?? "intake");
    setTitle("");
    setCalories(0);
    setDate(defaultDate ?? getToday());
    setTime(getNowTime());
    setError(null);
    setImageKey((k) => k + 1);
    setProtein("");
    setCarbohydrates("");
    setFat("");
    setFiber("");
    setWater("");
    setMealType(getDefaultMealType());
    setDuration("");
  }, [defaultDate, lockedType]);

  useEffect(() => {
    if (open && initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setCalories(initialData.calories);
      const dt = new Date(initialData.entryDate);
      setDate(dayjs(initialData.entryDate).format("YYYY-MM-DD"));
      setTime(
        `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`,
      );
      setError(null);
      setProtein(initialData.nutrition?.protein ?? "");
      setCarbohydrates(initialData.nutrition?.carbohydrates ?? "");
      setFat(initialData.nutrition?.fat ?? "");
      setFiber(initialData.nutrition?.fiber ?? "");
      setWater(initialData.water ?? "");
      setMealType(initialData.mealType ?? getDefaultMealType());
      setDuration(initialData.duration ?? "");
    } else if (open) {
      handleReset();
    }
  }, [open, initialData, handleReset]);

  // autoTriggerImage: 弹窗打开后自动触发图片文件选择
  useEffect(() => {
    if (open && autoTriggerImage && !initialData) {
      const timer = setTimeout(() => {
        imageAnalyzerRef.current?.triggerFileSelect();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, autoTriggerImage, initialData]);

  const handleSubmit = async () => {
    const normalizedCalories = calories === "" ? 0 : calories;
    if (!title || normalizedCalories <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const images =
        effectiveType === "intake" && token
          ? await imageAnalyzerRef.current?.resolveImages()
          : [];

      // 构建 nutrition 对象，未填字段不传
      const nutrition: NutritionInfo = {};
      if (protein !== "") nutrition.protein = Number(protein);
      if (carbohydrates !== "") nutrition.carbohydrates = Number(carbohydrates);
      if (fat !== "") nutrition.fat = Number(fat);
      if (fiber !== "") nutrition.fiber = Number(fiber);
      const hasNutrition = Object.keys(nutrition).length > 0;

      await onSubmit({
        type: effectiveType,
        title,
        calories: normalizedCalories,
        entryDate: new Date(`${date}T${time}`).toISOString(),
        ...(effectiveType === "intake" ? { images } : {}),
        ...(effectiveType === "intake" ? { mealType } : {}),
        ...(effectiveType === "intake" && hasNutrition ? { nutrition } : {}),
        ...(effectiveType === "intake" && water !== ""
          ? { water: Number(water) }
          : {}),
        ...(effectiveType === "burn" && duration !== ""
          ? { duration: Number(duration) }
          : {}),
      });
      handleReset();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    handleReset();
    onClose();
  };

  /* 统一表单字段样式 */
  const fieldSx = {
    "& .MuiInput-underline:before": { borderColor: "divider" },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      TransitionComponent={SlideUp}
      PaperProps={{
        sx: {
          borderRadius: 1,
          overflow: "hidden",
          maxHeight: "calc(100dvh - 32px)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <Box sx={{ px: 3, pt: 2.5, pb: 0.5 }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: 18 }}>
          {isEdit
            ? "编辑记录"
            : effectiveType === "intake"
              ? "新增饮食记录"
              : "新增运动记录"}
        </Typography>
      </Box>

      <DialogContent
        dividers
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {/* AI 图片识别 */}
        {effectiveType === "intake" && token && (
          <ImageUploadAnalyzer
            key={imageKey}
            ref={imageAnalyzerRef}
            token={token}
            initialImageUrl={initialData?.images?.[0] ?? null}
            onAnalyzed={({ title: t, calories: c }) => {
              setTitle(t);
              setCalories(c);
            }}
          />
        )}

        {/* 描述 */}
        <Autocomplete
          freeSolo
          options={presets}
          getOptionLabel={(option: string | PresetItem) =>
            typeof option === "string" ? option : option.label
          }
          onChange={(_, value) => {
            if (value && typeof value === "object") {
              setTitle((value as PresetItem).label);
              setCalories((value as PresetItem).calories);
              if ((value as PresetItem).duration) {
                setDuration((value as PresetItem).duration!);
              }
            }
          }}
          onInputChange={(_, value) => setTitle(value)}
          inputValue={title}
          renderOption={(props, option) => {
            const preset = option as PresetItem;
            return (
              <li {...props} key={preset.label}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <span>{preset.label}</span>
                  <Typography variant="caption" color="text.secondary">
                    {preset.duration ? `${preset.duration}分钟 · ` : ""}
                    {preset.calories} kcal
                  </Typography>
                </Box>
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              label={effectiveType === "intake" ? "食物描述" : "运动描述"}
              placeholder={
                effectiveType === "intake" ? "输入或选择食物" : "输入或选择运动"
              }
              sx={fieldSx}
            />
          )}
        />

        {/* 卡路里 */}
        <TextField
          variant="standard"
          label={
            effectiveType === "intake"
              ? "摄入卡路里 (kcal)"
              : "消耗卡路里 (kcal)"
          }
          type="number"
          value={calories}
          onChange={(e) => setCalories(parseNumericFieldValue(e.target.value))}
          sx={fieldSx}
        />

        {/* 运动时长（仅运动） */}
        {effectiveType === "burn" && (
          <TextField
            variant="standard"
            label="运动时长 (分钟)"
            type="number"
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="例如 30"
            sx={fieldSx}
          />
        )}

        {/* 餐食类型（仅摄入） */}
        {effectiveType === "intake" && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.75, display: "block" }}
            >
              餐食类型
            </Typography>
            <ToggleButtonGroup
              value={mealType}
              exclusive
              size="small"
              onChange={(_, val) => {
                if (val) setMealType(val);
              }}
              sx={{
                "& .MuiToggleButton-root": {
                  px: 2,
                  py: 0.5,
                  fontSize: 13,
                  fontWeight: 500,
                  textTransform: "none",
                  border: "1px solid",
                  borderColor: "divider",
                  color: "text.secondary",
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "#fff",
                    fontWeight: 600,
                    borderColor: "primary.main",
                    "&:hover": { bgcolor: "primary.dark" },
                  },
                },
              }}
            >
              {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map(
                (mt) => (
                  <ToggleButton key={mt} value={mt}>
                    {mealTypeLabels[mt]}
                  </ToggleButton>
                ),
              )}
            </ToggleButtonGroup>
          </Box>
        )}

        {/* 日期 + 时间 */}
        <Stack direction="row" spacing={2}>
          <TextField
            variant="standard"
            label="日期"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1, ...fieldSx }}
          />
          <TextField
            variant="standard"
            label="时间"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 120, ...fieldSx }}
          />
        </Stack>

        {/* 营养成分（仅摄入类型） */}
        {effectiveType === "intake" && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.75, display: "block" }}
            >
              营养成分{isReadonlyNutrition ? "（只读）" : "（可选）"}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <TextField
                variant="standard"
                label="蛋白质(g)"
                size="small"
                type="number"
                value={protein}
                onChange={(e) =>
                  setProtein(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                slotProps={{ input: { readOnly: isReadonlyNutrition } }}
                sx={{ flex: 1, ...fieldSx }}
              />
              <TextField
                variant="standard"
                label="碳水(g)"
                size="small"
                type="number"
                value={carbohydrates}
                onChange={(e) =>
                  setCarbohydrates(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                slotProps={{ input: { readOnly: isReadonlyNutrition } }}
                sx={{ flex: 1, ...fieldSx }}
              />
              <TextField
                variant="standard"
                label="脂肪(g)"
                size="small"
                type="number"
                value={fat}
                onChange={(e) =>
                  setFat(e.target.value === "" ? "" : Number(e.target.value))
                }
                slotProps={{ input: { readOnly: isReadonlyNutrition } }}
                sx={{ flex: 1, ...fieldSx }}
              />
              <TextField
                variant="standard"
                label="纤维(g)"
                size="small"
                type="number"
                value={fiber}
                onChange={(e) =>
                  setFiber(e.target.value === "" ? "" : Number(e.target.value))
                }
                slotProps={{ input: { readOnly: isReadonlyNutrition } }}
                sx={{ flex: 1, ...fieldSx }}
              />
            </Stack>
            <TextField
              variant="standard"
              label="水分(ml)"
              size="small"
              type="number"
              value={water}
              onChange={(e) =>
                setWater(e.target.value === "" ? "" : Number(e.target.value))
              }
              slotProps={{ input: { readOnly: isReadonlyNutrition } }}
              sx={{ mt: 1.5, width: 120, ...fieldSx }}
            />
          </Box>
        )}

        {/* 矿物质只读展示 */}
        {isBarcode && initialData?.minerals && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              微量元素（只读）
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {(
                Object.entries(initialData.minerals) as [
                  keyof MineralsInfo,
                  number | undefined,
                ][]
              ).map(([key, value]) => {
                if (!value) return null;
                const lbl = mineralLabels[key];
                return (
                  <Typography
                    key={key}
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 12 }}
                  >
                    {lbl?.name ?? key} {value}
                    {lbl?.unit ?? ""}
                  </Typography>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* 错误提示 */}
        {error && (
          <Typography variant="body2" color="error" textAlign="center">
            {error}
          </Typography>
        )}
      </DialogContent>

      {/* 底部操作 */}
      <DialogActions
        sx={{
          px: 3,
          pb: 2.5,
          pt: 1,
          justifyContent: "flex-end",
          flexShrink: 0,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{ textTransform: "none", color: "text.secondary" }}
        >
          取消
        </Button>
        <Button
          variant="contained"
          disabled={!title || (calories !== "" && calories <= 0) || submitting}
          onClick={handleSubmit}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 0.5,
            px: 3,
          }}
        >
          {submitting ? "提交中..." : isEdit ? "保存修改" : "确认添加"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
