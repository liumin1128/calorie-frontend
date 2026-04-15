"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import Fade from "@mui/material/Fade";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";
import type {
  ImageNutritionFood,
  MealType,
  CreateCalorieEntryDto,
} from "@/types/calorie";
import { getDefaultMealType, mealTypeLabels } from "@/types/calorie";
import {
  validateImageFile,
  analyzeImageNutrition,
} from "@/services/imageAnalysisService";

/* ───── 类型 ───── */

interface FoodDraft {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  unit: string;
  quantity: number;
  mealType: MealType;
  editing: boolean;
}

interface Props {
  open: boolean;
  token: string;
  selectedDate: string;
  onClose: () => void;
  onSave: (records: CreateCalorieEntryDto[]) => Promise<void>;
}

const SlideUp = forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

let idCounter = 0;
function nextId() {
  return `food-${++idCounter}`;
}

function foodToDto(f: FoodDraft, date: string): CreateCalorieEntryDto {
  return {
    type: "intake",
    title: f.name,
    calories: f.calories,
    entryDate: new Date(
      `${date}T${new Date().toTimeString().slice(0, 5)}`,
    ).toISOString(),
    mealType: f.mealType,
    nutrition: {
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: f.fiber,
    },
  };
}

/* ───── 营养条 ───── */

const nutrientColors = {
  protein: "#3d6b4f",
  carbs: "#f49420",
  fat: "#e87461",
  fiber: "#6b9b7a",
};

function NutrientBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: 11 }}
        >
          {label}
        </Typography>
        <Typography variant="caption" fontWeight={600} sx={{ fontSize: 11 }}>
          {Math.round(value)}g
        </Typography>
      </Stack>
      <Box
        sx={{
          height: 3,
          borderRadius: 2,
          bgcolor: "rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${Math.min((value / 50) * 100, 100)}%`,
            borderRadius: 2,
            bgcolor: color,
            transition: "width 0.4s ease",
          }}
        />
      </Box>
    </Stack>
  );
}

/* ───── 份数步进器 ───── */

function QuantityStepper({
  quantity,
  unit,
  onChange,
}: {
  quantity: number;
  unit: string;
  onChange: (val: number) => void;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "999px",
        height: 28,
        px: 0.25,
      }}
    >
      <IconButton
        size="small"
        disabled={quantity <= 0.5}
        onClick={() => onChange(+(quantity - 0.5).toFixed(1))}
        sx={{ p: 0.25, color: "text.secondary" }}
      >
        <RemoveIcon sx={{ fontSize: 14 }} />
      </IconButton>
      <Typography
        variant="caption"
        fontWeight={600}
        sx={{
          minWidth: 40,
          textAlign: "center",
          userSelect: "none",
          fontSize: 12,
        }}
      >
        {quantity} {unit}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onChange(+(quantity + 0.5).toFixed(1))}
        sx={{ p: 0.25, color: "text.secondary" }}
      >
        <AddIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Stack>
  );
}

/* ───── 单条食物卡片 ───── */

function FoodPreviewCard({
  food,
  onUpdate,
  onDelete,
  onToggleEdit,
}: {
  food: FoodDraft;
  onUpdate: (id: string, patch: Partial<FoodDraft>) => void;
  onDelete: (id: string) => void;
  onToggleEdit: (id: string) => void;
}) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: food.editing ? "primary.light" : "divider",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* 主行 */}
      <Box sx={{ px: 2, pt: 1.75, pb: food.editing ? 0 : 1.75 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* 卡路里圆点 */}
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "rgba(61,107,79,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={700}
              color="primary.main"
              sx={{ fontSize: 13 }}
            >
              {Math.round(food.calories)}
            </Typography>
          </Box>

          {/* 名称 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {food.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: 11 }}
            >
              {Math.round(food.calories)} kcal
            </Typography>
          </Box>

          {/* 份数步进 */}
          <QuantityStepper
            quantity={food.quantity}
            unit={food.unit}
            onChange={(val) => onUpdate(food.id, { quantity: val })}
          />

          {/* 展开/收起 */}
          <IconButton
            size="small"
            onClick={() => onToggleEdit(food.id)}
            sx={{ color: "text.secondary", p: 0.5 }}
          >
            {food.editing ? (
              <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </Stack>

        {/* 快捷区：餐次 + 营养 */}
        {!food.editing && (
          <Box sx={{ mt: 1.5 }}>
            {/* 餐次 */}
            <Stack direction="row" spacing={0.5} sx={{ mb: 1.5 }}>
              {mealTypes.map((mt) => (
                <Chip
                  key={mt}
                  label={mealTypeLabels[mt]}
                  size="small"
                  variant={food.mealType === mt ? "filled" : "outlined"}
                  color={food.mealType === mt ? "primary" : "default"}
                  onClick={() => onUpdate(food.id, { mealType: mt })}
                  sx={{
                    borderRadius: "999px",
                    fontSize: 11,
                    height: 24,
                    cursor: "pointer",
                    fontWeight: food.mealType === mt ? 600 : 400,
                  }}
                />
              ))}
            </Stack>

            {/* 营养条 */}
            <Stack direction="row" spacing={1.5}>
              <NutrientBar
                label="蛋白质"
                value={food.protein}
                color={nutrientColors.protein}
              />
              <NutrientBar
                label="碳水"
                value={food.carbs}
                color={nutrientColors.carbs}
              />
              <NutrientBar
                label="脂肪"
                value={food.fat}
                color={nutrientColors.fat}
              />
              <NutrientBar
                label="纤维"
                value={food.fiber}
                color={nutrientColors.fiber}
              />
            </Stack>
          </Box>
        )}
      </Box>

      {/* 展开编辑 */}
      <Collapse in={food.editing}>
        <Box
          sx={{
            px: 2,
            pt: 1.5,
            pb: 2,
            mt: 1,
            borderTop: "1px dashed",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column",
            gap: 1.75,
          }}
        >
          <TextField
            label="名称"
            variant="standard"
            size="small"
            value={food.name}
            onChange={(e) => onUpdate(food.id, { name: e.target.value })}
            fullWidth
          />

          {/* 餐次 */}
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.75, display: "block" }}
            >
              餐次
            </Typography>
            <Stack direction="row" spacing={0.75}>
              {mealTypes.map((mt) => (
                <Chip
                  key={mt}
                  label={mealTypeLabels[mt]}
                  size="small"
                  variant={food.mealType === mt ? "filled" : "outlined"}
                  color={food.mealType === mt ? "primary" : "default"}
                  onClick={() => onUpdate(food.id, { mealType: mt })}
                  sx={{ borderRadius: "999px", cursor: "pointer" }}
                />
              ))}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <TextField
              label="卡路里"
              variant="standard"
              size="small"
              type="number"
              value={food.calories || ""}
              onChange={(e) =>
                onUpdate(food.id, { calories: Number(e.target.value) })
              }
              sx={{ flex: 1 }}
            />
            <TextField
              label="数量"
              variant="standard"
              size="small"
              type="number"
              value={food.quantity || ""}
              onChange={(e) =>
                onUpdate(food.id, { quantity: Number(e.target.value) })
              }
              sx={{ width: 72 }}
            />
            <TextField
              label="单位"
              variant="standard"
              size="small"
              value={food.unit}
              onChange={(e) => onUpdate(food.id, { unit: e.target.value })}
              sx={{ width: 72 }}
            />
          </Stack>

          <Stack direction="row" spacing={1.5}>
            <TextField
              label="蛋白质(g)"
              variant="standard"
              size="small"
              type="number"
              value={food.protein || ""}
              onChange={(e) =>
                onUpdate(food.id, { protein: Number(e.target.value) })
              }
              sx={{ flex: 1 }}
            />
            <TextField
              label="碳水(g)"
              variant="standard"
              size="small"
              type="number"
              value={food.carbs || ""}
              onChange={(e) =>
                onUpdate(food.id, { carbs: Number(e.target.value) })
              }
              sx={{ flex: 1 }}
            />
            <TextField
              label="脂肪(g)"
              variant="standard"
              size="small"
              type="number"
              value={food.fat || ""}
              onChange={(e) =>
                onUpdate(food.id, { fat: Number(e.target.value) })
              }
              sx={{ flex: 1 }}
            />
            <TextField
              label="纤维(g)"
              variant="standard"
              size="small"
              type="number"
              value={food.fiber || ""}
              onChange={(e) =>
                onUpdate(food.id, { fiber: Number(e.target.value) })
              }
              sx={{ flex: 1 }}
            />
          </Stack>

          {/* 删除 */}
          <Button
            size="small"
            color="error"
            onClick={() => onDelete(food.id)}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              fontSize: 12,
            }}
          >
            删除此项
          </Button>
        </Box>
      </Collapse>
    </Box>
  );
}

/* ───── 主组件 ───── */

export default function AiAnalysisPreview({
  open,
  token,
  selectedDate,
  onClose,
  onSave,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foods, setFoods] = useState<FoodDraft[]>([]);
  const [saving, setSaving] = useState(false);

  const stage = analyzing ? "analyzing" : foods.length > 0 ? "preview" : "idle";

  const totalCalories = useMemo(
    () => foods.reduce((s, f) => s + f.calories, 0),
    [foods],
  );

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFoods([]);
    setError(null);
    setAnalyzing(false);
    setSaving(false);
  }, [previewUrl]);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleEntered = () => {
    inputRef.current?.click();
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validationError = validateImageFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setFoods([]);

      setAnalyzing(true);
      try {
        const res = await analyzeImageNutrition(token, file);
        if (!res.foods?.length) {
          setError("未识别到食物，请重试或手动添加");
          return;
        }
        const defaultMeal = getDefaultMealType();
        setFoods(
          res.foods.map(
            (f: ImageNutritionFood): FoodDraft => ({
              id: nextId(),
              name: f.name,
              calories: f.calories,
              protein: f.protein,
              carbs: f.carbs,
              fat: f.fat,
              fiber: f.fiber,
              unit: f.unit,
              quantity: f.quantity,
              mealType: defaultMeal,
              editing: false,
            }),
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "分析失败，请重试");
      } finally {
        setAnalyzing(false);
      }
    },
    [token, previewUrl],
  );

  const handleUpdateFood = useCallback(
    (id: string, patch: Partial<FoodDraft>) => {
      setFoods((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      );
    },
    [],
  );

  const handleDeleteFood = useCallback((id: string) => {
    setFoods((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleToggleEdit = useCallback((id: string) => {
    setFoods((prev) =>
      prev.map((f) => (f.id === id ? { ...f, editing: !f.editing } : f)),
    );
  }, []);

  const handleSaveAll = async () => {
    if (foods.length === 0) return;
    setSaving(true);
    try {
      const dtos = foods.map((f) => foodToDto(f, selectedDate));
      await onSave(dtos);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      TransitionComponent={SlideUp}
      TransitionProps={{ onEntered: handleEntered }}
      PaperProps={{
        sx: { borderRadius: 4, overflow: "hidden", maxHeight: "88vh" },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        hidden
      />

      {/* ─── 图片区 ─── */}
      {previewUrl && (
        <Box sx={{ position: "relative" }}>
          <Box
            component="img"
            src={previewUrl}
            alt="食物图片"
            sx={{
              width: "100%",
              height: 200,
              objectFit: "cover",
              display: "block",
            }}
          />
          {/* 渐变遮罩 */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.4) 100%)",
            }}
          />
          {/* 关闭 */}
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              bgcolor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(4px)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
          {/* 进度条 */}
          {analyzing && (
            <LinearProgress
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                "& .MuiLinearProgress-bar": { bgcolor: "primary.light" },
                bgcolor: "transparent",
              }}
            />
          )}
          {/* 底部统计 */}
          {stage === "preview" && (
            <Fade in>
              <Box
                sx={{
                  position: "absolute",
                  bottom: 12,
                  left: 16,
                  right: 16,
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "#fff" }}
                >
                  识别到 {foods.length} 项
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: "#fff" }}
                >
                  {Math.round(totalCalories)} kcal
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>
      )}

      {/* ─── 无图片 header ─── */}
      {!previewUrl && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            pt: 2,
            pb: 1,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoAwesomeIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              AI 识别
            </Typography>
          </Stack>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      )}

      {/* ─── 内容区 ─── */}
      <Box
        sx={{
          px: 2.5,
          pb: 2.5,
          pt: previewUrl ? 2 : 0,
          overflowY: "auto",
        }}
      >
        {/* 分析中 */}
        {stage === "analyzing" && (
          <Box sx={{ textAlign: "center", py: 5 }}>
            <AutoAwesomeIcon
              sx={{ fontSize: 36, color: "primary.light", mb: 1.5 }}
            />
            <Typography variant="body2" color="text.secondary">
              正在识别食物...
            </Typography>
          </Box>
        )}

        {/* 空 */}
        {stage === "idle" && !error && (
          <Box
            onClick={() => inputRef.current?.click()}
            sx={{
              textAlign: "center",
              py: 5,
              cursor: "pointer",
              borderRadius: 3,
              border: "2px dashed",
              borderColor: "divider",
              transition: "border-color 0.2s, background 0.2s",
              "&:hover": {
                borderColor: "primary.light",
                bgcolor: "rgba(61,107,79,0.03)",
              },
            }}
          >
            <CameraAltIcon
              sx={{ fontSize: 32, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              点击选择食物图片
            </Typography>
          </Box>
        )}

        {/* 错误 */}
        {error && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="error" sx={{ mb: 1.5 }}>
              {error}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setError(null);
                inputRef.current?.click();
              }}
            >
              重新选择
            </Button>
          </Box>
        )}

        {/* ─── 预览列表 ─── */}
        {stage === "preview" && (
          <Fade in>
            <Box>
              <Stack spacing={1.5}>
                {foods.map((food, i) => (
                  <Box
                    key={food.id}
                    sx={{
                      animation: "fadeUp 0.35s ease-out both",
                      animationDelay: `${i * 0.06}s`,
                      "@keyframes fadeUp": {
                        from: {
                          opacity: 0,
                          transform: "translateY(12px)",
                        },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    <FoodPreviewCard
                      food={food}
                      onUpdate={handleUpdateFood}
                      onDelete={handleDeleteFood}
                      onToggleEdit={handleToggleEdit}
                    />
                  </Box>
                ))}
              </Stack>

              {/* 底部操作 */}
              <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    handleReset();
                    inputRef.current?.click();
                  }}
                  sx={{ color: "text.secondary", textTransform: "none" }}
                >
                  重新拍照
                </Button>
                <Box sx={{ flex: 1 }} />
                <Button
                  variant="contained"
                  disableElevation
                  disabled={foods.length === 0 || saving}
                  onClick={handleSaveAll}
                  sx={{
                    borderRadius: "999px",
                    px: 3,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {saving ? "保存中..." : `保存 ${foods.length} 条`}
                </Button>
              </Stack>
            </Box>
          </Fade>
        )}
      </Box>
    </Dialog>
  );
}
