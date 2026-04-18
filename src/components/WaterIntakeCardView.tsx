"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ReplayIcon from "@mui/icons-material/Replay";
import WaterCup from "@/components/WaterCup";

const WATER_CARD_MIN_HEIGHT = 200;

interface WaterIntakeCardViewProps {
  amount: number;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  cupVolumeMl: number;
  maxCups: number;
  onRetry: () => void;
  onSelectCup: (cupCount: number) => void;
}

export default function WaterIntakeCardView({
  amount,
  loading,
  submitting,
  error,
  cupVolumeMl,
  maxCups,
  onRetry,
  onSelectCup,
}: WaterIntakeCardViewProps) {
  const fullCupCount = Math.floor(amount / cupVolumeMl);
  const remainder = amount % cupVolumeMl;
  const visibleCupCount = Math.max(
    maxCups,
    fullCupCount + (remainder > 0 ? 1 : 0),
  );
  const cups = Array.from({ length: visibleCupCount }, (_, index) => index + 1);
  const skeletonCups = Array.from({ length: maxCups }, (_, index) => index);

  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={3} sx={{ minHeight: WATER_CARD_MIN_HEIGHT }}>
          <Box>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <WaterDropIcon color="primary" fontSize="small" />
                <Typography variant="h6" component="h2">
                  今日饮水
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="baseline" spacing={0.75}>
                {loading ? (
                  <>
                    <Skeleton variant="text" width={48} height={36} />
                    <Skeleton variant="text" width={20} height={20} />
                  </>
                ) : (
                  <>
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      color="primary.main"
                    >
                      {amount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ml
                    </Typography>
                  </>
                )}
              </Stack>
            </Stack>
          </Box>

          {error && (
            <Alert
              severity="error"
              action={
                <ButtonBase
                  onClick={onRetry}
                  sx={{ borderRadius: 2, px: 1, py: 0.25 }}
                >
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <ReplayIcon sx={{ fontSize: 16 }} />
                    <Typography variant="caption">重试</Typography>
                  </Stack>
                </ButtonBase>
              }
            >
              {error}
            </Alert>
          )}

          {loading ? (
            <Stack spacing={3} sx={{ flex: 1 }}>
              <Stack
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="row"
                gap="8px"
                flexWrap="wrap"
              >
                <Skeleton variant="text" width={84} height={18} />
                <Skeleton variant="text" width={96} height={18} />
                <Skeleton variant="text" width={80} height={18} />
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                  gap: 2,
                  flex: 1,
                }}
              >
                {skeletonCups.map((cupIndex) => (
                  <Box
                    key={cupIndex}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Skeleton variant="rounded" width={36} height={44} />
                  </Box>
                ))}
              </Box>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Stack
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="row"
                gap="8px"
              >
                <Typography variant="caption" color="text.secondary">
                  每杯 {cupVolumeMl}ml
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  已喝 {fullCupCount} 杯
                  {remainder > 0 ? `，另有 ${remainder}ml` : ""}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  点击可调整杯数
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
                  gap: 2,
                }}
              >
                {cups.map((cupCount) => {
                  const filled = cupCount <= fullCupCount;

                  return (
                    <WaterCup
                      key={cupCount}
                      filled={filled}
                      disabled={submitting}
                      onClick={() => onSelectCup(cupCount)}
                    />
                  );
                })}
              </Box>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
