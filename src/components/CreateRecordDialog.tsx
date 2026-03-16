"use client";

import { useState } from "react";
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
import type { CalorieRecord, PresetItem } from "@/types/calorie";
import { foodPresets, exercisePresets } from "@/types/calorie";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (record: Omit<CalorieRecord, "id">) => void;
}

function getNowTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export default function CreateRecordDialog({ open, onClose, onSubmit }: Props) {
  const [type, setType] = useState<"food" | "exercise">("food");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState<number>(0);
  const [time, setTime] = useState(getNowTime);

  const presets = type === "food" ? foodPresets : exercisePresets;

  const handleReset = () => {
    setType("food");
    setDescription("");
    setCalories(0);
    setTime(getNowTime);
  };

  const handleSubmit = () => {
    if (!description || calories <= 0) return;
    const today = new Date().toISOString().split("T")[0];
    onSubmit({ description, type, calories, time: `${today}T${time}` });
    handleReset();
    onClose();
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>新增记录</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          <ToggleButtonGroup
            value={type}
            exclusive
            onChange={(_, v) => {
              if (v) {
                setType(v);
                setDescription("");
                setCalories(0);
              }
            }}
            fullWidth
          >
            <ToggleButton value="food">
              <RestaurantIcon sx={{ mr: 1 }} /> 饮食
            </ToggleButton>
            <ToggleButton value="exercise">
              <FitnessCenterIcon sx={{ mr: 1 }} /> 运动
            </ToggleButton>
          </ToggleButtonGroup>

          <Autocomplete
            freeSolo
            options={presets}
            getOptionLabel={(option: string | PresetItem) =>
              typeof option === "string" ? option : option.label
            }
            onChange={(_, value) => {
              if (value && typeof value === "object") {
                setDescription((value as PresetItem).label);
                setCalories((value as PresetItem).calories);
              }
            }}
            onInputChange={(_, value) => setDescription(value)}
            inputValue={description}
            renderInput={(params) => (
              <TextField
                {...params}
                label={type === "food" ? "食物描述" : "运动描述"}
                placeholder={
                  type === "food" ? "输入或选择食物" : "输入或选择运动"
                }
              />
            )}
          />

          <TextField
            label="时间"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label={type === "food" ? "摄入卡路里 (kcal)" : "消耗卡路里 (kcal)"}
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
              {type === "food"
                ? `🍽️ 将摄入 ${calories} kcal`
                : `🏃 将消耗 ${calories} kcal`}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>取消</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!description || calories <= 0}
        >
          确认添加
        </Button>
      </DialogActions>
    </Dialog>
  );
}
