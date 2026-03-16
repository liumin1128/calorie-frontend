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
import Box from "@mui/material/Box";
import type { UserProfile } from "@/types/calorie";

interface Props {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

export default function ProfileDialog({
  open,
  profile,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<UserProfile>(profile);

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>个人信息设置</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
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
            label="年龄"
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={handleSave}>
          保存
        </Button>
      </DialogActions>
    </Dialog>
  );
}
