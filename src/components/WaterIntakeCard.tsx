"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import WaterIntakeCardView from "@/components/WaterIntakeCardView";
import {
  useWaterIntakeStore,
  WATER_CUP_VOLUME_ML,
} from "@/stores/waterIntakeStore";

const DEFAULT_MAX_CUPS = 10;

export default function WaterIntakeCard() {
  const { token } = useAuth();
  const amount = useWaterIntakeStore((state) => state.amount);
  const loading = useWaterIntakeStore((state) => state.loading);
  const submitting = useWaterIntakeStore((state) => state.submitting);
  const error = useWaterIntakeStore((state) => state.error);
  const fetchToday = useWaterIntakeStore((state) => state.fetchToday);
  const setAmountByCup = useWaterIntakeStore((state) => state.setAmountByCup);

  useEffect(() => {
    if (!token) return;
    void fetchToday(token);
  }, [fetchToday, token]);

  if (!token) return null;

  return (
    <WaterIntakeCardView
      amount={amount}
      loading={loading}
      submitting={submitting}
      error={error}
      cupVolumeMl={WATER_CUP_VOLUME_ML}
      maxCups={DEFAULT_MAX_CUPS}
      onRetry={() => void fetchToday(token)}
      onSelectCup={(cupCount) => void setAmountByCup(token, cupCount)}
    />
  );
}
