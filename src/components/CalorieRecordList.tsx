"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import dayjs from "dayjs";
import type { CalorieEntry } from "@/types/calorie";
import { formatTime } from "@/utils/calorie";

interface CalorieRecordListProps {
  entries: CalorieEntry[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  onEdit: (entry: CalorieEntry) => void;
  onDelete: (id: string) => void;
  onRetry: () => void;
  onOpenCreate: () => void;
}

export default function CalorieRecordList({
  entries,
  loading,
  error,
  selectedDate,
  onEdit,
  onDelete,
  onRetry,
  onOpenCreate,
}: CalorieRecordListProps) {
  const isToday = selectedDate === dayjs().format("YYYY-MM-DD");

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ListAltIcon color="primary" fontSize="small" />
            <Typography variant="h6" fontWeight="bold">
              {isToday ? "今日记录" : `${selectedDate} 记录`}
            </Typography>
          </Stack>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={onOpenCreate}
          >
            新增
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={onRetry}>
                重试
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={24} />
          </Box>
        ) : entries.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              暂无记录
            </Typography>
            <Typography variant="caption" color="text.secondary">
              点击上方按钮添加饮食或运动记录
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {entries.map((entry) => (
              <Box
                key={entry._id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1.5,
                  transition: "background-color 0.15s",
                  borderRadius: 1,
                  mx: -1,
                  px: 1,
                  "&:hover": { bgcolor: "rgba(61,107,79,0.03)" },
                }}
              >
                {/* Color bar */}
                <Box
                  sx={{
                    width: 4,
                    height: 32,
                    borderRadius: 2,
                    bgcolor:
                      entry.type === "intake" ? "primary.main" : "warning.main",
                    flexShrink: 0,
                  }}
                />
                {/* Icon */}
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor:
                      entry.type === "intake"
                        ? "rgba(61,107,79,0.08)"
                        : "rgba(244,148,32,0.08)",
                    flexShrink: 0,
                  }}
                >
                  {entry.type === "intake" ? (
                    <RestaurantIcon
                      sx={{ fontSize: 16, color: "primary.main" }}
                    />
                  ) : (
                    <FitnessCenterIcon
                      sx={{ fontSize: 16, color: "warning.main" }}
                    />
                  )}
                </Box>
                {/* Title + time */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={500} noWrap>
                    {entry.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(entry.entryDate)}
                  </Typography>
                </Box>
                {/* Calories */}
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={
                    entry.type === "intake" ? "primary.main" : "warning.main"
                  }
                  sx={{ flexShrink: 0 }}
                >
                  {entry.type === "intake" ? "+" : "-"}
                  {Math.round(entry.calories)} kcal
                </Typography>
                {/* Actions */}
                <Box sx={{ display: "flex", gap: 0.25, flexShrink: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(entry)}
                    sx={{ color: "text.secondary" }}
                  >
                    <EditIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(entry._id)}
                    sx={{ color: "text.secondary" }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
