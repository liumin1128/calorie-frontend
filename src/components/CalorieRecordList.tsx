"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
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
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ListAltIcon color="primary" />
          <Typography variant="h5" fontWeight="bold">
            {isToday ? "今日记录" : `${selectedDate} 记录`}
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onOpenCreate}
        >
          新增记录
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
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1.5} sx={{ mb: 4 }}>
          {entries.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              暂无记录，点击上方按钮添加
            </Typography>
          )}
          {entries.map((entry) => (
            <Card key={entry._id} elevation={1}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ width: 45, flexShrink: 0 }}
                  >
                    {formatTime(entry.entryDate)}
                  </Typography>
                  <Chip
                    size="small"
                    icon={
                      entry.type === "intake" ? (
                        <RestaurantIcon />
                      ) : (
                        <FitnessCenterIcon />
                      )
                    }
                    label={entry.type === "intake" ? "饮食" : "运动"}
                    color={entry.type === "intake" ? "primary" : "warning"}
                    variant="outlined"
                    sx={{ width: 80 }}
                  />
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    {entry.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={
                      entry.type === "intake" ? "primary.main" : "warning.main"
                    }
                  >
                    {entry.type === "intake" ? "+" : "-"}
                    {Math.round(entry.calories)} kcal
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(entry)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => onDelete(entry._id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
