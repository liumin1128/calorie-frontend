"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import dayjs from "dayjs";
import type {
  CalorieType,
  CalorieEntry,
  CreateCalorieEntryDto,
  PresetItem,
} from "@/types/calorie";
import { foodPresets, exercisePresets } from "@/types/calorie";
import { useAuth } from "@/contexts/AuthContext";
import ImageUploadAnalyzer from "@/components/ImageUploadAnalyzer";
import type { ImageUploadAnalyzerRef } from "@/components/ImageUploadAnalyzer";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCalorieEntryDto) => void | Promise<void>;
  initialData?: CalorieEntry | null;
  defaultDate?: string;
  lockedType?: CalorieType | null;
  autoTriggerImage?: boolean;
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
  const [type, setType] = useState<CalorieType>("intake");
  const [title, setTitle] = useState("");
  const [calories, setCalories] = useState<number>(0);
  const [date, setDate] = useState(getToday);
  const [time, setTime] = useState(getNowTime);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageKey, setImageKey] = useState(0);
  const imageAnalyzerRef = useRef<ImageUploadAnalyzerRef>(null);

  const effectiveType = lockedType ?? type;
  const presets = effectiveType === "intake" ? foodPresets : exercisePresets;

  const handleReset = useCallback(() => {
    setType(lockedType ?? "intake");
    setTitle("");
    setCalories(0);
    setDate(defaultDate ?? getToday());
    setTime(getNowTime());
    setError(null);
    setImageKey((k) => k + 1);
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
    if (!title || calories <= 0) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        type: effectiveType,
        title,
        calories,
        entryDate: new Date(`${date}T${time}`).toISOString(),
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit
          ? "编辑记录"
          : lockedType
            ? lockedType === "intake"
              ? "新增饮食记录"
              : "新增运动记录"
            : "新增记录"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          {!lockedType && (
            <ToggleButtonGroup
              value={effectiveType}
              exclusive
              onChange={(_, v) => {
                if (v) {
                  setType(v);
                  setTitle("");
                  setCalories(0);
                  setImageKey((k) => k + 1);
                }
              }}
              fullWidth
            >
              <ToggleButton value="intake">
                <RestaurantIcon sx={{ mr: 1 }} /> 饮食
              </ToggleButton>
              <ToggleButton value="burn">
                <FitnessCenterIcon sx={{ mr: 1 }} /> 运动
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          {effectiveType === "intake" && token && (
            <ImageUploadAnalyzer
              key={imageKey}
              ref={imageAnalyzerRef}
              token={token}
              onAnalyzed={({ title: t, calories: c }) => {
                setTitle(t);
                setCalories(c);
              }}
            />
          )}

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
              }
            }}
            onInputChange={(_, value) => setTitle(value)}
            inputValue={title}
            renderInput={(params) => (
              <TextField
                {...params}
                label={effectiveType === "intake" ? "食物描述" : "运动描述"}
                placeholder={
                  effectiveType === "intake"
                    ? "输入或选择食物"
                    : "输入或选择运动"
                }
              />
            )}
          />

          <TextField
            label="日期"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="时间"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label={
              effectiveType === "intake"
                ? "摄入卡路里 (kcal)"
                : "消耗卡路里 (kcal)"
            }
            type="number"
            value={calories || ""}
            onChange={(e) => setCalories(Number(e.target.value))}
            helperText="选择预设项自动填充，也可手动输入"
          />

          {calories > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              {effectiveType === "intake"
                ? `🍽️ 将摄入 ${Math.round(calories)} kcal`
                : `🏃 将消耗 ${Math.round(calories)} kcal`}
            </Typography>
          )}

          {error && (
            <Typography variant="body2" color="error" textAlign="center">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!title || calories <= 0 || submitting}
        >
          {submitting ? "提交中..." : isEdit ? "保存修改" : "确认添加"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
