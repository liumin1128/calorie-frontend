"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { getSuggestion } from "@/services/adviceService";

interface Props {
  token: string;
}

export default function HealthAdviceCard({ token }: Props) {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSuggestion(token);
      setAdvice(result.suggestion);
    } catch (e) {
      setError(e instanceof Error ? e.message : "获取建议失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

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
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
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

        <Button
          variant={advice ? "outlined" : "contained"}
          onClick={handleFetch}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />
          }
        >
          {loading ? "生成中..." : advice ? "重新获取" : "获取健康建议"}
        </Button>
      </CardContent>
    </Card>
  );
}
