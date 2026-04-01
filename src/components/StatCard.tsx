"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {icon}
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" fontWeight="bold" color={color}>
          {Math.round(value).toLocaleString()}
          <Typography
            component="span"
            variant="body1"
            color="text.secondary"
            ml={0.5}
          >
            {unit ?? "kcal"}
          </Typography>
        </Typography>
      </CardContent>
    </Card>
  );
}
