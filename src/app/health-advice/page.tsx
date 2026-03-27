"use client";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useAuth } from "@/contexts/AuthContext";
import HealthAdviceCard from "@/components/HealthAdviceCard";

export default function HealthAdvicePage() {
  const { token } = useAuth();

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AutoAwesomeIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">
          AI 健康建议
        </Typography>
      </Box>
      {token && <HealthAdviceCard token={token} />}
    </Container>
  );
}
