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
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import EditNoteIcon from "@mui/icons-material/EditNote";
import Tooltip from "@mui/material/Tooltip";
import dayjs from "dayjs";
import type { RecordEntryType } from "@/components/RecordTypeSelector";
import { useMemo } from "react";
import type { CalorieEntry, CalorieType } from "@/types/calorie";
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
  onSelectEntryType: (type: RecordEntryType) => void;
}

/* ---- 单条记录行 ---- */
function RecordRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: CalorieEntry;
  onEdit: (e: CalorieEntry) => void;
  onDelete: (id: string) => void;
}) {
  const isIntake = entry.type === "intake";
  return (
    <Box
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
      <Box
        sx={{
          width: 4,
          height: 32,
          borderRadius: 2,
          bgcolor: isIntake ? "primary.main" : "warning.main",
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isIntake ? "rgba(61,107,79,0.08)" : "rgba(244,148,32,0.08)",
          flexShrink: 0,
        }}
      >
        {isIntake ? (
          <RestaurantIcon sx={{ fontSize: 16, color: "primary.main" }} />
        ) : (
          <FitnessCenterIcon sx={{ fontSize: 16, color: "warning.main" }} />
        )}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={500} noWrap>
          {entry.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatTime(entry.entryDate)}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        fontWeight="bold"
        color={isIntake ? "primary.main" : "warning.main"}
        sx={{ flexShrink: 0 }}
      >
        {isIntake ? "+" : "-"}
        {Math.round(entry.calories)} kcal
      </Typography>
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
  );
}

/* ---- 饮食入口按钮组 ---- */
function IntakeActions({
  onSelect,
}: {
  onSelect: (type: RecordEntryType) => void;
}) {
  const actions: {
    type: RecordEntryType;
    icon: React.ReactNode;
    tip: string;
    disabled?: boolean;
  }[] = [
    {
      type: "ai-image",
      icon: <CameraAltIcon fontSize="small" />,
      tip: "AI 图片识别",
    },
    {
      type: "qr-code",
      icon: <QrCodeScannerIcon fontSize="small" />,
      tip: "二维码识别（即将支持）",
      disabled: true,
    },
    {
      type: "manual-diet",
      icon: <EditNoteIcon fontSize="small" />,
      tip: "手动输入",
    },
  ];
  return (
    <Stack direction="row" spacing={0.5}>
      {actions.map((a) => (
        <Tooltip key={a.type} title={a.tip} arrow>
          <span>
            <IconButton
              size="small"
              disabled={a.disabled}
              onClick={() => onSelect(a.type)}
              sx={{
                color: a.disabled ? "text.disabled" : "primary.main",
                bgcolor: a.disabled ? undefined : "rgba(61,107,79,0.06)",
                "&:hover": { bgcolor: "rgba(61,107,79,0.12)" },
              }}
            >
              {a.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Stack>
  );
}

/* ---- 单类型卡片 ---- */
function TypeCard({
  type,
  entries,
  loading,
  onEdit,
  onDelete,
  onAdd,
  onSelectEntryType,
}: {
  type: CalorieType;
  entries: CalorieEntry[];
  loading: boolean;
  onEdit: (e: CalorieEntry) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSelectEntryType?: (type: RecordEntryType) => void;
}) {
  const isIntake = type === "intake";
  const total = useMemo(
    () => entries.reduce((s, e) => s + e.calories, 0),
    [entries],
  );

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            {isIntake ? (
              <RestaurantIcon color="primary" fontSize="small" />
            ) : (
              <FitnessCenterIcon sx={{ color: "warning.main", fontSize: 20 }} />
            )}
            <Typography variant="subtitle1" fontWeight="bold">
              {isIntake ? "饮食记录" : "运动记录"}
            </Typography>
          </Stack>
          {isIntake && onSelectEntryType ? (
            <IntakeActions onSelect={onSelectEntryType} />
          ) : (
            <Button size="small" startIcon={<AddIcon />} onClick={onAdd}>
              新增
            </Button>
          )}
        </Box>

        {/* 小计 */}
        {entries.length > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            {isIntake ? "摄入" : "消耗"} {Math.round(total)} kcal
          </Typography>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={20} />
          </Box>
        ) : entries.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {isIntake ? "暂无饮食记录" : "暂无运动记录"}
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {entries.map((entry) => (
              <RecordRow
                key={entry._id}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

/* ---- 主组件：两张卡片 ---- */
export default function CalorieRecordList({
  entries,
  loading,
  error,
  selectedDate,
  onEdit,
  onDelete,
  onRetry,
  onOpenCreate,
  onSelectEntryType,
}: CalorieRecordListProps) {
  const isToday = selectedDate === dayjs().format("YYYY-MM-DD");

  const intakeEntries = useMemo(
    () => entries.filter((e) => e.type === "intake"),
    [entries],
  );
  const burnEntries = useMemo(
    () => entries.filter((e) => e.type === "burn"),
    [entries],
  );

  return (
    <Stack spacing={2}>
      {/* 日期标题 + 全局错误 */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {isToday ? "今日记录" : `${selectedDate} 记录`}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              重试
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* 饮食卡片 */}
      <TypeCard
        type="intake"
        entries={intakeEntries}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onOpenCreate}
        onSelectEntryType={onSelectEntryType}
      />

      {/* 运动卡片 */}
      <TypeCard
        type="burn"
        entries={burnEntries}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onAdd={onOpenCreate}
      />
    </Stack>
  );
}
