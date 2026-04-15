"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Collapse from "@mui/material/Collapse";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import Fade from "@mui/material/Fade";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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
  carbohydrates: number;
  fat: number;
  fiber: number;
  water: number;
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
    water: f.water,
    entryDate: new Date(
      `${date}T${new Date().toTimeString().slice(0, 5)}`,
    ).toISOString(),
    mealType: f.mealType,
    nutrition: {
      protein: f.protein,
      carbohydrates: f.carbohydrates,
      fat: f.fat,
      fiber: f.fiber,
    },
  };
}

/* ───── 营养摘要文本 ───── */

function NutrientSummary({ food }: { food: FoodDraft }) {
  const parts = [
    food.protein > 0 && `蛋白质${Math.round(food.protein)}g`,
    food.carbohydrates > 0 && `碳水${Math.round(food.carbohydrates)}g`,
    food.fat > 0 && `脂肪${Math.round(food.fat)}g`,
    food.fiber > 0 && `纤维${Math.round(food.fiber)}g`,
    food.water > 0 && `水分${Math.round(food.water)}ml`,
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ fontSize: 11, lineHeight: 1.4 }}
    >
      {parts.join(" · ")}
    </Typography>
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
    <Stack direction="row" alignItems="center" spacing={0.25}>
      <IconButton
        size="small"
        disabled={quantity <= 0.5}
        onClick={() => onChange(+(quantity - 0.5).toFixed(1))}
        sx={{
          width: 28,
          height: 28,
          borderRadius: 0.5,
          color: "rgba(0,0,0,0.25)",
          bgcolor: "rgba(0,0,0,0.04)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
        }}
      >
        <RemoveIcon sx={{ fontSize: 16 }} />
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
        {quantity}
        {unit}
      </Typography>
      <IconButton
        size="small"
        onClick={() => onChange(+(quantity + 0.5).toFixed(1))}
        sx={{
          width: 28,
          height: 28,
          borderRadius: 0.5,
          color: "rgba(0,0,0,0.25)",
          bgcolor: "rgba(0,0,0,0.04)",
          "&:hover": { bgcolor: "rgba(0,0,0,0.08)" },
        }}
      >
        <AddIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Stack>
  );
}

/* ───── 单条食物条目 ───── */

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
        borderRadius: 0.5,
        border: "1px solid",
        borderColor: food.editing ? "primary.light" : "divider",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <Box sx={{ px: 2, py: 1.75 }}>
        {/* 第一行：名称 + 操作（份数 + 编辑 + 删除） */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="body2"
            fontWeight={600}
            noWrap
            sx={{ flexShrink: 1, minWidth: 0 }}
          >
            {food.name}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: 11, flexShrink: 0 }}
          >
            {mealTypeLabels[food.mealType]}
          </Typography>
          <Box sx={{ flex: 1 }} />
          <QuantityStepper
            quantity={food.quantity}
            unit={food.unit}
            onChange={(val) => onUpdate(food.id, { quantity: val })}
          />
          <IconButton
            size="small"
            onClick={() => onToggleEdit(food.id)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.5,
              color: food.editing ? "primary.main" : "text.secondary",
              bgcolor: food.editing
                ? "rgba(61,107,79,0.08)"
                : "rgba(0,0,0,0.04)",
              "&:hover": {
                bgcolor: food.editing
                  ? "rgba(61,107,79,0.14)"
                  : "rgba(0,0,0,0.08)",
              },
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onDelete(food.id)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0.5,
              color: "text.secondary",
              bgcolor: "rgba(0,0,0,0.04)",
              "&:hover": {
                bgcolor: "rgba(244,68,54,0.08)",
                color: "error.main",
              },
            }}
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Stack>

        {/* 第二行：突出卡路里 + 营养摘要 */}
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1 }}>
          <Typography
            variant="body1"
            fontWeight={700}
            color="primary.main"
            sx={{ fontSize: 18, lineHeight: 1.3 }}
          >
            {Math.round(food.calories)}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: 12 }}
          >
            kcal
          </Typography>
          <NutrientSummary food={food} />
        </Stack>
      </Box>

      {/* 展开编辑 */}
      <Collapse in={food.editing}>
        <Box
          sx={{
            px: 2,
            pt: 1.25,
            pb: 1.5,
            bgcolor: "rgba(61,107,79,0.02)",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* 餐次选择 */}
          <ToggleButtonGroup
            value={food.mealType}
            exclusive
            size="small"
            onChange={(_, val) => {
              if (val) onUpdate(food.id, { mealType: val });
            }}
            sx={{
              height: 30,
              "& .MuiToggleButton-root": {
                px: 1.5,
                py: 0,
                fontSize: 12,
                fontWeight: 500,
                lineHeight: 1,
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
            {mealTypes.map((mt) => (
              <ToggleButton key={mt} value={mt}>
                {mealTypeLabels[mt]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Stack direction="row" spacing={1.5}>
            <TextField
              label="名称"
              variant="standard"
              size="small"
              value={food.name}
              onChange={(e) => onUpdate(food.id, { name: e.target.value })}
              sx={{ flex: 1 }}
            />
            <TextField
              label="卡路里"
              variant="standard"
              size="small"
              type="number"
              value={food.calories || ""}
              onChange={(e) =>
                onUpdate(food.id, { calories: Number(e.target.value) })
              }
              sx={{ width: 80 }}
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
              sx={{ width: 60 }}
            />
            <TextField
              label="单位"
              variant="standard"
              size="small"
              value={food.unit}
              onChange={(e) => onUpdate(food.id, { unit: e.target.value })}
              sx={{ width: 60 }}
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
              value={food.carbohydrates || ""}
              onChange={(e) =>
                onUpdate(food.id, { carbohydrates: Number(e.target.value) })
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
              protein: f.nutrition?.protein ?? 0,
              carbohydrates: f.nutrition?.carbohydrates ?? 0,
              fat: f.nutrition?.fat ?? 0,
              fiber: f.nutrition?.fiber ?? 0,
              water: f.water ?? 0,
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
        sx: { borderRadius: 1, overflow: "hidden", maxHeight: "88vh" },
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
              borderRadius: 0.5,
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
              <Stack spacing={1}>
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
                    borderRadius: 0.5,
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
