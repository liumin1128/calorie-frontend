"use client";

import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";

interface CalorieRingProps {
  /** 当前值 */
  value: number;
  /** 最大值，达到后圆环闭合 */
  max?: number;
  /** 圆环尺寸（直径），默认 40 */
  size?: number;
  /** 圆环线宽，默认 3 */
  strokeWidth?: number;
  /** 圆环颜色，支持 MUI theme 色值 */
  color?: string;
  /** 轨道颜色 */
  trackColor?: string;
  /** 中间内容 */
  children?: React.ReactNode;
}

export default function CalorieRing({
  value,
  max = 1000,
  size = 40,
  strokeWidth = 3,
  color,
  trackColor,
  children,
}: CalorieRingProps) {
  const theme = useTheme();

  const ratio = Math.min(value / max, 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  // 解析 MUI 主题色值（如 "primary.main" → theme.palette.primary.main）
  const resolveColor = (c: string | undefined, fallback: string) => {
    if (!c) return fallback;
    const parts = c.split(".");
    let result: unknown = theme.palette;
    for (const p of parts) {
      result = (result as Record<string, unknown>)?.[p];
    }
    return typeof result === "string" ? result : fallback;
  };

  const ringColor = resolveColor(color, theme.palette.primary.main);
  const ringTrack = resolveColor(trackColor, theme.palette.divider);

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", transform: "rotate(-90deg)" }}
      >
        {/* 轨道 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringTrack}
          strokeWidth={strokeWidth}
        />
        {/* 进度 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {children}
    </Box>
  );
}
