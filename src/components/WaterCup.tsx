"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";

interface WaterCupProps {
  filled: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function WaterCup({
  filled,
  disabled = false,
  onClick,
}: WaterCupProps) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{ borderRadius: 3, textAlign: "left" }}
    >
      <Stack spacing={0.5} sx={{ width: "100%", alignItems: "center" }}>
        <Box
          sx={(theme) => ({
            position: "relative",
            width: "100%",
            maxWidth: 36,
            height: 44,
            borderRadius: "12px 12px 10px 10px / 8px 8px 14px 14px",
            clipPath: "polygon(6% 4%, 94% 4%, 80% 100%, 20% 100%)",
            border: `2px solid ${filled ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.45)}`,
            backgroundColor: filled
              ? alpha(theme.palette.primary.light, 0.12)
              : alpha(theme.palette.primary.main, 0.05),
            boxShadow: filled
              ? `inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.15)}`
              : `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}`,
            overflow: "hidden",
            transition: "transform 0.18s ease, border-color 0.18s ease",
            "&::after": {
              content: '""',
              position: "absolute",
              insetInline: 0,
              bottom: 0,
              height: filled ? "78%" : 0,
              background: `linear-gradient(180deg, ${alpha(theme.palette.secondary.light, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.78)} 100%)`,
              transition: "height 0.2s ease",
            },
            "&:hover": disabled
              ? undefined
              : {
                  transform: "translateY(-2px)",
                  borderColor: theme.palette.primary.main,
                },
          })}
        >
          <Box
            sx={{
              position: "absolute",
              insetInline: 5,
              top: 4,
              height: 3,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,0.65)",
              zIndex: 1,
            }}
          />
        </Box>
      </Stack>
    </ButtonBase>
  );
}
