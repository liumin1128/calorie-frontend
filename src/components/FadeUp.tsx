"use client";

import Box, { type BoxProps } from "@mui/material/Box";

interface FadeUpProps extends BoxProps {
  /** 动画延迟，如 "0.15s"，默认 "0s" */
  delay?: string;
}

export default function FadeUp({ delay = "0s", sx, ...rest }: FadeUpProps) {
  return (
    <Box
      sx={{
        animation: `fadeUp 0.7s ease-out ${delay} both`,
        ...sx,
      }}
      {...rest}
    />
  );
}
