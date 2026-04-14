"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
}

export default function StatCard({
  title,
  value,
  unit,
  icon,
  color,
}: StatCardProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(61,107,79,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(61,107,79,0.06)",
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
      </Box>
      <Typography
        variant="h5"
        fontWeight="bold"
        color={color}
        sx={{ lineHeight: 1.2 }}
      >
        {Math.round(value).toLocaleString()}
        <Typography
          component="span"
          variant="body2"
          color="text.secondary"
          ml={0.5}
          fontWeight={400}
        >
          {unit ?? "kcal"}
        </Typography>
      </Typography>
    </Box>
  );
}
