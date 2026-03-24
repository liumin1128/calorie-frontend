"use client";

import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Fab from "@mui/material/Fab";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import type {
  CalorieEntry,
  CalorieType,
  CreateCalorieEntryDto,
} from "@/types/calorie";
import { calculateBMR } from "@/types/calorie";
import { calculateAge } from "@/types/user";
import CreateRecordDialog from "@/components/CreateRecordDialog";
import ProfileDialog from "@/components/ProfileDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/contexts/UserProfileContext";
import {
  getCalorieEntries,
  createCalorieEntry,
  updateCalorieEntry,
  deleteCalorieEntry,
} from "@/services/calorieService";

/* ───── 工具函数 ───── */

function sumCalories(entries: CalorieEntry[], type: CalorieType) {
  return entries
    .filter((e) => e.type === type)
    .reduce((s, e) => s + e.calories, 0);
}

function formatTime(entryDate: string) {
  const dt = new Date(entryDate);
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
}

/* ───── 统计卡片 ───── */

function StatCard({
  title,
  value,
  unit,
  icon,
  color,
}: {
  title: string;
  value: number;
  unit?: string;
  icon: React.ReactNode;
  color?: string;
}) {
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
          {value.toLocaleString()}
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

/* ───── 主页面 ───── */

export default function Home() {
  const { user, token, logout } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();

  // API data
  const [entries, setEntries] = useState<CalorieEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalorieEntry | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Load entries for selected date
  const loadEntries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // endDate 需要传次日，因为后端 new Date("2026-03-23") = UTC 午夜零点，
      // 当天带时间的记录（如 15:30）会被 $lte 过滤掉
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const endDate = nextDay.toISOString().split("T")[0];

      const res = await getCalorieEntries(token, {
        startDate: selectedDate,
        endDate,
        pageSize: 100,
      });
      setEntries(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [token, selectedDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // 从 profile 派生数据
  const height = profile?.latestHeight?.value ?? 0;
  const weight = profile?.latestWeight?.value ?? 0;
  const gender =
    profile?.gender === "female" ? ("female" as const) : ("male" as const);
  const age = profile?.birthday ? calculateAge(profile.birthday) : 0;
  const hasProfile = !!profile && height > 0 && weight > 0 && age > 0;

  // Statistics
  const intake = sumCalories(entries, "intake");
  const burn = sumCalories(entries, "burn");
  const bmr = hasProfile ? calculateBMR({ age, height, weight, gender }) : 0;
  const net = intake - burn - bmr;

  /* ── Event handlers ── */

  const handleSubmitRecord = async (data: CreateCalorieEntryDto) => {
    if (!token) return;
    if (editingEntry) {
      await updateCalorieEntry(token, editingEntry._id, data);
    } else {
      await createCalorieEntry(token, data);
    }
    await loadEntries();
  };

  const handleDeleteRecord = async (id: string) => {
    if (!token) return;
    try {
      await deleteCalorieEntry(token, id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  };

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (entry: CalorieEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <Box sx={{ flexGrow: 1, pb: 10 }}>
      {/* ── 顶部导航 ── */}
      <AppBar position="static">
        <Toolbar>
          <LocalFireDepartmentIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Calorie Tracker
          </Typography>
          <Button
            color="inherit"
            startIcon={<PersonIcon />}
            onClick={() => setProfileOpen(true)}
          >
            {user?.nickname || "个人信息"}
          </Button>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={logout}>
            退出
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* ── 个人信息摘要 ── */}
        <Card elevation={1} sx={{ mb: 3, bgcolor: "primary.50" }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            {profileLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <CircularProgress size={20} />
              </Box>
            ) : hasProfile ? (
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                <Chip
                  icon={<PersonIcon />}
                  label={`${gender === "male" ? "男" : "女"} · ${age}岁`}
                />
                <Chip label={`身高 ${height} cm`} variant="outlined" />
                <Chip label={`体重 ${weight} kg`} variant="outlined" />
                <Chip
                  label={`基础代谢 ${bmr} kcal/天`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>
            ) : (
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  请先完善个人信息以计算基础代谢
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setProfileOpen(true)}
                >
                  去设置
                </Button>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* ── 日期选择 + 概览 ── */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            📊 {isToday ? "今日概览" : `${selectedDate} 概览`}
          </Typography>
          <TextField
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 180 }}
          />
        </Stack>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              title="饮食摄入"
              value={intake}
              icon={<RestaurantIcon color="primary" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              title="运动消耗"
              value={burn}
              icon={<FitnessCenterIcon color="warning" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              title="基础代谢"
              value={bmr}
              icon={<LocalFireDepartmentIcon color="secondary" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              title="净卡路里"
              value={net}
              icon={
                net >= 0 ? (
                  <TrendingUpIcon color="error" />
                ) : (
                  <TrendingDownIcon color="success" />
                )
              }
              color={net >= 0 ? "error.main" : "success.main"}
            />
          </Grid>
        </Grid>

        {/* ── 记录列表 ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            📝 {isToday ? "今日记录" : `${selectedDate} 记录`}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
          >
            新增记录
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadEntries}>
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
                        entry.type === "intake"
                          ? "primary.main"
                          : "warning.main"
                      }
                    >
                      {entry.type === "intake" ? "+" : "-"}
                      {entry.calories} kcal
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(entry)}
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteRecord(entry._id)}
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
      </Container>

      {/* ── 浮动按钮 ── */}
      <Fab
        color="primary"
        aria-label="新增记录"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={handleOpenCreate}
      >
        <AddIcon />
      </Fab>

      {/* ── 弹窗 ── */}
      <CreateRecordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmitRecord}
        initialData={editingEntry}
      />
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </Box>
  );
}
