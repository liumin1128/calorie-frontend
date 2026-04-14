"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
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
  const targetWeight = profile?.targetWeight;

  const hasWeightGoal = hasProfile && targetWeight && targetWeight > 0;
  const weightProgress = hasWeightGoal
    ? Math.max(0, Math.min(100, ((weight - targetWeight) / weight) * 100))
    : 0;

  return (
    <Card
      elevation={0}
      sx={{ mb: 2.5, border: "1px solid", borderColor: "divider" }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {profileLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : hasProfile ? (
          <Stack spacing={2}>
            {/* User row */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "primary.light",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {profile.nickname?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {profile.nickname || "用户"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {gender === "male" ? "男" : "女"} · {age}岁 · {height}cm ·{" "}
                  {weight}kg
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={onOpenProfile}
                sx={{ minWidth: 0, fontSize: 12 }}
              >
                编辑
              </Button>
            </Stack>

            {/* BMR */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: "rgba(61,107,79,0.04)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                基础代谢率
              </Typography>
              <Typography
                variant="body1"
                fontWeight="bold"
                color="primary.main"
              >
                {Math.round(bmr)} kcal/天
              </Typography>
            </Box>

            {/* Weight goal */}
            {hasWeightGoal && (
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                >
                  <Typography variant="caption" color="text.secondary">
                    目标体重
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {weight}kg → {targetWeight}kg
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={weightProgress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "rgba(61,107,79,0.08)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 3,
                      bgcolor: "primary.main",
                    },
                  }}
                />
              </Box>
            )}
          </Stack>
        ) : (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 1 }}>
            <PersonIcon
              sx={{ fontSize: 32, color: "text.secondary", opacity: 0.5 }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              完善个人信息以计算基础代谢
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
