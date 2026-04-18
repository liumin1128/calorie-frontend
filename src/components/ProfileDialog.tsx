"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { updateProfile } from "@/services/userService";
import * as dynamicDataService from "@/services/dynamicDataService";
import type { Gender } from "@/types/user";

interface Props {
  open: boolean;
  onClose: () => void;
}

type NumericFieldValue = number | "";

interface FormState {
  nickname: string;
  gender: Gender;
  birthday: string;
  signature: string;
  height: NumericFieldValue;
  weight: NumericFieldValue;
  targetWeight: NumericFieldValue;
  healthConditions: string[];
}

function parseNumericFieldValue(value: string): NumericFieldValue {
  return value === "" ? "" : Number(value);
}

function buildInitialForm(
  profile: ReturnType<typeof useUserProfile>["profile"],
): FormState {
  return {
    nickname: profile?.nickname ?? "",
    gender: (profile?.gender as Gender) ?? "male",
    birthday: profile?.birthday?.split("T")[0] ?? "",
    signature: profile?.signature ?? "",
    height: profile?.latestHeight?.value ?? 170,
    weight: profile?.latestWeight?.value ?? 60,
    targetWeight: profile?.targetWeight ?? 0,
    healthConditions: profile?.healthConditions ?? [],
  };
}

export default function ProfileDialog({ open, onClose }: Props) {
  const { token } = useAuth();
  const { profile, refreshProfile } = useUserProfile();

  const [form, setForm] = useState<FormState>(() => buildInitialForm(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthInput, setHealthInput] = useState("");
  const [healthInputError, setHealthInputError] = useState<string | null>(null);

  // 每次打开弹窗时同步最新 profile 数据
  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(profile));
      setError(null);
      setHealthInput("");
      setHealthInputError(null);
    }
  }, [open, profile]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);

    try {
      const height = form.height === "" ? 0 : form.height;
      const weight = form.weight === "" ? 0 : form.weight;
      const targetWeight = form.targetWeight === "" ? 0 : form.targetWeight;
      const promises: Promise<unknown>[] = [];

      // 基础资料
      promises.push(
        updateProfile(token, {
          nickname: form.nickname || undefined,
          gender: form.gender,
          birthday: form.birthday || undefined,
          signature: form.signature || undefined,
          targetWeight: targetWeight > 0 ? targetWeight : undefined,
          healthConditions: form.healthConditions,
        }),
      );

      // 身高：值变化时追加记录
      const origHeight = profile?.latestHeight?.value;
      if (height > 0 && height !== origHeight) {
        promises.push(
          dynamicDataService.create(token, {
            category: "height",
            value: height,
          }),
        );
      }

      // 体重：值变化时追加记录
      const origWeight = profile?.latestWeight?.value;
      if (weight > 0 && weight !== origWeight) {
        promises.push(
          dynamicDataService.create(token, {
            category: "weight",
            value: weight,
          }),
        );
      }

      await Promise.all(promises);
      await refreshProfile();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: {
          maxHeight: "calc(100dvh - 32px)",
        },
      }}
    >
      <DialogTitle>个人信息设置</DialogTitle>
      <DialogContent
        dividers
        sx={{
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            label="昵称"
            value={form.nickname}
            onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          />

          <ToggleButtonGroup
            value={form.gender}
            exclusive
            onChange={(_, v) => v && setForm({ ...form, gender: v })}
            fullWidth
          >
            <ToggleButton value="male">男</ToggleButton>
            <ToggleButton value="female">女</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            label="生日"
            type="date"
            value={form.birthday}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="身高 (cm)"
            type="number"
            value={form.height}
            onChange={(e) =>
              setForm({
                ...form,
                height: parseNumericFieldValue(e.target.value),
              })
            }
          />

          <TextField
            label="体重 (kg)"
            type="number"
            value={form.weight}
            onChange={(e) =>
              setForm({
                ...form,
                weight: parseNumericFieldValue(e.target.value),
              })
            }
            slotProps={{ htmlInput: { step: 0.1 } }}
          />

          <TextField
            label="目标体重 (kg)"
            type="number"
            value={form.targetWeight}
            onChange={(e) =>
              setForm({
                ...form,
                targetWeight: parseNumericFieldValue(e.target.value),
              })
            }
            slotProps={{ htmlInput: { step: 0.1, min: 30, max: 300 } }}
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              健康状况
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
              {form.healthConditions.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() =>
                    setForm({
                      ...form,
                      healthConditions: form.healthConditions.filter(
                        (t) => t !== tag,
                      ),
                    })
                  }
                />
              ))}
            </Box>
            <TextField
              size="small"
              fullWidth
              placeholder="输入标签后按 Enter 添加"
              value={healthInput}
              onChange={(e) => {
                setHealthInput(e.target.value);
                setHealthInputError(null);
              }}
              onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const tag = healthInput.trim();
                if (!tag) return;
                if (tag.length > 50) {
                  setHealthInputError("标签最多 50 个字符");
                  return;
                }
                if (!form.healthConditions.includes(tag)) {
                  setForm({
                    ...form,
                    healthConditions: [...form.healthConditions, tag],
                  });
                }
                setHealthInput("");
              }}
              error={!!healthInputError}
              helperText={healthInputError}
            />
          </Box>

          <TextField
            label="个性签名"
            multiline
            rows={2}
            value={form.signature}
            onChange={(e) => setForm({ ...form, signature: e.target.value })}
            slotProps={{ htmlInput: { maxLength: 200 } }}
            helperText={`${form.signature.length}/200`}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          取消
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
        >
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
