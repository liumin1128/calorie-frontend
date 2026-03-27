"use client";

import { useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useHealthAdviceStore } from "@/stores/healthAdviceStore";

interface Props {
  token: string;
}

export default function HealthAdviceCard({ token }: Props) {
  const advice = useHealthAdviceStore((s) => s.advice);
  const loading = useHealthAdviceStore((s) => s.loading);
  const error = useHealthAdviceStore((s) => s.error);
  const fetchAdvice = useHealthAdviceStore((s) => s.fetchAdvice);

  useEffect(() => {
    fetchAdvice(token);
  }, [token, fetchAdvice]);

  const handleRefresh = () => fetchAdvice(token, { force: true });

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <AutoAwesomeIcon color="primary" />
          <Typography variant="h6" component="h2">
            AI 健康建议
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {advice && (
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", mb: 2, color: "text.secondary" }}
          >
            {advice}
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              生成中...
            </Typography>
          </Box>
        ) : (
          <Button
            variant={advice ? "outlined" : "contained"}
            onClick={advice ? handleRefresh : () => fetchAdvice(token)}
            startIcon={<AutoAwesomeIcon />}
          >
            {advice ? "重新获取" : "获取健康建议"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
