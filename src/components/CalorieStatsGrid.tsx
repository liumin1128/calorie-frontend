"use client";

import Grid from "@mui/material/Grid";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import StatCard from "@/components/StatCard";

interface CalorieStatsGridProps {
  intake: number;
  burn: number;
  bmr: number;
}

export default function CalorieStatsGrid({
  intake,
  burn,
  bmr,
}: CalorieStatsGridProps) {
  const net = intake - burn - bmr;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          title="饮食摄入"
          value={intake}
          icon={<RestaurantIcon color="primary" />}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          title="运动消耗"
          value={burn}
          icon={<FitnessCenterIcon color="warning" />}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          title="基础代谢"
          value={bmr}
          icon={<LocalFireDepartmentIcon color="secondary" />}
        />
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <StatCard
          title="净卡路里"
          value={net}
          icon={
            net >= 0 ? (
              <TrendingUpIcon color="error" />
            ) : (
              <TrendingDownIcon color="success" />
            )
          }
          color={net >= 0 ? "error.main" : "success.main"}
        />
      </Grid>
    </Grid>
  );
}
