"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { fadeUp, fadeIn, gentleFloat } from "@/lib/animations";
import {
  authBrandSubtitleSx,
  authBrandTitleSx,
  authContentPanelSx,
  authContentStackSx,
  authDecorCircleBottomSx,
  authDecorCircleTopSx,
  authIllustrationPanelSx,
  authIllustrationWrapSx,
  authPageShellSx,
} from "@/components/auth/authStyles";

interface AuthLayoutProps {
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ subtitle, children }: AuthLayoutProps) {
  return (
    <Box sx={authPageShellSx}>
      <Box
        sx={(theme) => ({
          ...authIllustrationPanelSx(theme),
          animation: `${fadeIn} 0.8s ease-out`,
        })}
      >
        <Box sx={authDecorCircleTopSx} />
        <Box sx={authDecorCircleBottomSx} />

        <Box
          sx={{
            ...authIllustrationWrapSx,
            animation: `${gentleFloat} 6s ease-in-out infinite`,
          }}
        >
          <Image
            src="/illustrations/login-hero.svg"
            alt="健康饮食插画"
            width={420}
            height={380}
            priority
            style={{
              maxWidth: "100%",
              height: "auto",
              filter: "drop-shadow(0 8px 24px rgba(61,107,79,0.08))",
            }}
          />
        </Box>
      </Box>

      <Box sx={authContentPanelSx}>
        <Stack
          sx={{ ...authContentStackSx, animation: `${fadeUp} 0.7s ease-out` }}
          spacing={3.5}
        >
          <Stack spacing={0.5}>
            <Typography sx={authBrandTitleSx}>CaloTrack</Typography>
            <Typography sx={authBrandSubtitleSx}>{subtitle}</Typography>
          </Stack>

          {children}
        </Stack>
      </Box>
    </Box>
  );
}
