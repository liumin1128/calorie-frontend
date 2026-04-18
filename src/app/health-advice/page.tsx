"use client";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAuth } from "@/contexts/AuthContext";
import HealthAdviceCard from "@/components/HealthAdviceCard";
import { fadeUp } from "@/lib/animations";

export default function HealthAdvicePage() {
  const { token } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 6 }}>
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            animation: `${fadeUp} 0.7s ease-out`,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(61,107,79,0.08)",
            }}
          >
            <AutoAwesomeIcon color="primary" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              AI 健康建议
            </Typography>
            <Typography variant="caption" color="text.secondary">
              基于你的饮食和健康数据，为你生成个性化建议
            </Typography>
          </Box>
        </Box>
        <Box sx={{ animation: `${fadeUp} 0.7s ease-out 0.1s both` }}>
          {token && <HealthAdviceCard token={token} />}
        </Box>
      </Stack>
    </Container>
  );
}
