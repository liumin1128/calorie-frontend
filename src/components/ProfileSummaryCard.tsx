"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import PersonIcon from "@mui/icons-material/Person";
import { calculateBMR } from "@/types/calorie";
import { calculateAge } from "@/types/user";
import type { UserFullProfile } from "@/types/user";

const PROFILE_CARD_MIN_HEIGHT = 220;

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
      sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            minHeight: PROFILE_CARD_MIN_HEIGHT,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {profileLoading ? (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="42%" height={24} />
                  <Skeleton variant="text" width="72%" height={20} />
                </Box>
                <Skeleton variant="rounded" width={38} height={24} />
              </Stack>

              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(61,107,79,0.04)",
                }}
              >
                <Skeleton variant="text" width={72} height={18} />
                <Skeleton variant="text" width={126} height={30} />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                >
                  <Skeleton variant="text" width={54} height={18} />
                  <Skeleton variant="text" width={92} height={18} />
                </Stack>
                <Skeleton variant="rounded" width="100%" height={6} />
              </Box>
            </Stack>
          ) : hasProfile ? (
            <Stack spacing={2}>
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
        </Box>
      </CardContent>
    </Card>
  );
}
