"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { updateProfile } from "@/services/userService";
import * as dynamicDataService from "@/services/dynamicDataService";
import type { Gender } from "@/types/user";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormState {
  nickname: string;
  gender: Gender;
  birthday: string;
  signature: string;
  height: number;
  weight: number;
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
  };
}

export default function ProfileDialog({ open, onClose }: Props) {
  const { token } = useAuth();
  const { profile, refreshProfile } = useUserProfile();

  const [form, setForm] = useState<FormState>(() => buildInitialForm(profile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 每次打开弹窗时同步最新 profile 数据
  useEffect(() => {
    if (open) {
      setForm(buildInitialForm(profile));
      setError(null);
    }
  }, [open, profile]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError(null);

    try {
      const promises: Promise<unknown>[] = [];

      // 基础资料
      promises.push(
        updateProfile(token, {
          nickname: form.nickname || undefined,
          gender: form.gender,
          birthday: form.birthday || undefined,
          signature: form.signature || undefined,
        }),
      );

      // 身高：值变化时追加记录
      const origHeight = profile?.latestHeight?.value;
      if (form.height > 0 && form.height !== origHeight) {
        promises.push(
          dynamicDataService.create(token, {
            category: "height",
            value: form.height,
          }),
        );
      }

      // 体重：值变化时追加记录
      const origWeight = profile?.latestWeight?.value;
      if (form.weight > 0 && form.weight !== origWeight) {
        promises.push(
          dynamicDataService.create(token, {
            category: "weight",
            value: form.weight,
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>个人信息设置</DialogTitle>
      <DialogContent>
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
              setForm({ ...form, height: Number(e.target.value) })
            }
          />

          <TextField
            label="体重 (kg)"
            type="number"
            value={form.weight}
            onChange={(e) =>
              setForm({ ...form, weight: Number(e.target.value) })
            }
            slotProps={{ htmlInput: { step: 0.1 } }}
          />

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
