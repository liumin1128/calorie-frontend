"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import PersonIcon from "@mui/icons-material/Person";
import { calculateBMR } from "@/types/calorie";
import { calculateAge } from "@/types/user";
import type { UserFullProfile } from "@/types/user";

interface ProfileSummaryCardProps {
  profile: UserFullProfile | null;
  profileLoading: boolean;
  onOpenProfile: () => void;
}

export default function ProfileSummaryCard({
  profile,
  profileLoading,
  onOpenProfile,
}: ProfileSummaryCardProps) {
  const height = profile?.latestHeight?.value ?? 0;
  const weight = profile?.latestWeight?.value ?? 0;
  const gender =
    profile?.gender === "female" ? ("female" as const) : ("male" as const);
  const age = profile?.birthday ? calculateAge(profile.birthday) : 0;
  const hasProfile = !!profile && height > 0 && weight > 0 && age > 0;
  const bmr = hasProfile ? calculateBMR({ age, height, weight, gender }) : 0;

  return (
    <Card elevation={1} sx={{ mb: 3, bgcolor: "primary.50" }}>
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        {profileLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <CircularProgress size={20} />
          </Box>
        ) : hasProfile ? (
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            <Chip
              icon={<PersonIcon />}
              label={`${gender === "male" ? "男" : "女"} · ${age}岁`}
            />
            <Chip label={`身高 ${height} cm`} variant="outlined" />
            <Chip label={`体重 ${weight} kg`} variant="outlined" />
            <Chip
              label={`基础代谢 ${Math.round(bmr)} kcal/天`}
              color="primary"
              variant="outlined"
            />
          </Stack>
        ) : (
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              请先完善个人信息以计算基础代谢
            </Typography>
            <Button size="small" variant="outlined" onClick={onOpenProfile}>
              去设置
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
