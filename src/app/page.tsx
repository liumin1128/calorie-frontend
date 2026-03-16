"use client";

import { useState } from "react";
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
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CalorieRecord, UserProfile, WeightRecord } from "@/types/calorie";
import { calculateBMR } from "@/types/calorie";
import CreateRecordDialog from "@/components/CreateRecordDialog";
import ProfileDialog from "@/components/ProfileDialog";

/* ───── 模拟数据 ───── */

const TODAY = "2026-03-16";
const YESTERDAY = "2026-03-15";

const initialRecords: CalorieRecord[] = [
  {
    id: "y1",
    description: "早餐 - 包子2个+豆浆",
    type: "food",
    calories: 320,
    time: `${YESTERDAY}T07:30`,
  },
  {
    id: "y2",
    description: "午餐 - 米饭+番茄炒蛋+青菜",
    type: "food",
    calories: 490,
    time: `${YESTERDAY}T12:00`,
  },
  {
    id: "y3",
    description: "快走(30分钟)",
    type: "exercise",
    calories: 150,
    time: `${YESTERDAY}T15:00`,
  },
  {
    id: "y4",
    description: "晚餐 - 面条+小菜",
    type: "food",
    calories: 420,
    time: `${YESTERDAY}T18:00`,
  },
  {
    id: "y5",
    description: "游泳(30分钟)",
    type: "exercise",
    calories: 250,
    time: `${YESTERDAY}T20:00`,
  },
  {
    id: "y6",
    description: "夜宵 - 水果",
    type: "food",
    calories: 100,
    time: `${YESTERDAY}T21:30`,
  },
  {
    id: "t1",
    description: "早餐 - 鸡蛋2个+全麦面包+牛奶",
    type: "food",
    calories: 426,
    time: `${TODAY}T08:00`,
  },
  {
    id: "t2",
    description: "午餐 - 米饭+鸡胸肉+炒青菜",
    type: "food",
    calories: 475,
    time: `${TODAY}T12:15`,
  },
  {
    id: "t3",
    description: "跑步(30分钟)",
    type: "exercise",
    calories: 300,
    time: `${TODAY}T14:00`,
  },
  {
    id: "t4",
    description: "下午茶 - 苹果+酸奶",
    type: "food",
    calories: 215,
    time: `${TODAY}T15:30`,
  },
  {
    id: "t5",
    description: "晚餐 - 鸡胸肉沙拉",
    type: "food",
    calories: 315,
    time: `${TODAY}T18:30`,
  },
  {
    id: "t6",
    description: "散步(30分钟)",
    type: "exercise",
    calories: 100,
    time: `${TODAY}T19:30`,
  },
];

const initialWeightHistory: WeightRecord[] = [
  { date: "03/10", weight: 71.2 },
  { date: "03/11", weight: 71.0 },
  { date: "03/12", weight: 70.8 },
  { date: "03/13", weight: 70.5 },
  { date: "03/14", weight: 70.7 },
  { date: "03/15", weight: 70.3 },
  { date: "03/16", weight: 70.0 },
];

const initialProfile: UserProfile = {
  age: 28,
  height: 175,
  weight: 70.0,
  gender: "male",
};

/* ───── 工具函数 ───── */

function sumCalories(records: CalorieRecord[], type: "food" | "exercise") {
  return records
    .filter((r) => r.type === type)
    .reduce((s, r) => s + r.calories, 0);
}

function formatTime(time: string) {
  return time.split("T")[1]?.slice(0, 5) ?? "";
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
  const [records, setRecords] = useState<CalorieRecord[]>(initialRecords);
  const [weightHistory, setWeightHistory] =
    useState<WeightRecord[]>(initialWeightHistory);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  // 按日期过滤
  const todayRecords = records.filter((r) => r.time.startsWith(TODAY));
  const yesterdayRecords = records.filter((r) => r.time.startsWith(YESTERDAY));

  // 今日统计
  const todayIntake = sumCalories(todayRecords, "food");
  const todayBurn = sumCalories(todayRecords, "exercise");
  const bmr = calculateBMR(profile);
  const todayNet = todayIntake - todayBurn - bmr;

  // 昨日统计
  const ydIntake = sumCalories(yesterdayRecords, "food");
  const ydBurn = sumCalories(yesterdayRecords, "exercise");
  const ydNet = ydIntake - ydBurn - bmr;

  // 体重趋势
  const weights = weightHistory.map((w) => w.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;

  /* ── 事件处理 ── */

  const handleAddRecord = (record: Omit<CalorieRecord, "id">) => {
    const id = `r${Date.now()}`;
    setRecords((prev) =>
      [...prev, { ...record, id }].sort((a, b) => a.time.localeCompare(b.time)),
    );
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveProfile = (p: UserProfile) => {
    setProfile(p);
  };

  const handleUpdateWeight = () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) return;
    const todayLabel = `${TODAY.slice(5).replace("-", "/")}`;
    setWeightHistory((prev) => {
      const exists = prev.findIndex((r) => r.date === todayLabel);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = { date: todayLabel, weight: w };
        return next;
      }
      return [...prev, { date: todayLabel, weight: w }];
    });
    setProfile((prev) => ({ ...prev, weight: w }));
    setNewWeight("");
    setWeightOpen(false);
  };

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
            个人信息
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {/* ── 个人信息摘要 ── */}
        <Card elevation={1} sx={{ mb: 3, bgcolor: "primary.50" }}>
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
            >
              <Chip
                icon={<PersonIcon />}
                label={`${profile.gender === "male" ? "男" : "女"} · ${profile.age}岁`}
              />
              <Chip label={`身高 ${profile.height} cm`} variant="outlined" />
              <Chip label={`体重 ${profile.weight} kg`} variant="outlined" />
              <Chip
                label={`基础代谢 ${bmr} kcal/天`}
                color="primary"
                variant="outlined"
              />
              <Box sx={{ flexGrow: 1 }} />
              <Button
                size="small"
                variant="outlined"
                onClick={() => setWeightOpen(true)}
              >
                更新体重
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* ── 今日概览 ── */}
        <Typography variant="h5" gutterBottom fontWeight="bold">
          📊 今日概览
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              title="饮食摄入"
              value={todayIntake}
              icon={<RestaurantIcon color="primary" />}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard
              title="运动消耗"
              value={todayBurn}
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
              value={todayNet}
              icon={
                todayNet >= 0 ? (
                  <TrendingUpIcon color="error" />
                ) : (
                  <TrendingDownIcon color="success" />
                )
              }
              color={todayNet >= 0 ? "error.main" : "success.main"}
            />
          </Grid>
        </Grid>

        {/* ── 昨日报告 ── */}
        <Typography variant="h5" gutterBottom fontWeight="bold">
          📋 昨日报告
        </Typography>
        <Alert
          severity={ydNet <= 0 ? "success" : "warning"}
          sx={{ mb: 4 }}
          icon={ydNet <= 0 ? <TrendingDownIcon /> : <TrendingUpIcon />}
        >
          <AlertTitle>{YESTERDAY} 卡路里总结</AlertTitle>
          <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 1 }}>
            <Typography variant="body2">
              🍽️ 总摄入: <b>{ydIntake}</b> kcal
            </Typography>
            <Typography variant="body2">
              🏃 运动消耗: <b>{ydBurn}</b> kcal
            </Typography>
            <Typography variant="body2">
              🔥 基础代谢: <b>{bmr}</b> kcal
            </Typography>
          </Stack>
          <Typography variant="body2" fontWeight="bold">
            {ydNet <= 0
              ? `✅ 净消耗 ${Math.abs(ydNet)} kcal，处于热量缺口，有助于减重`
              : `⚠️ 净摄入 ${ydNet} kcal，处于热量盈余`}
          </Typography>
        </Alert>

        {/* ── 体重趋势 ── */}
        <Typography variant="h5" gutterBottom fontWeight="bold">
          ⚖️ 体重趋势（最近 {weightHistory.length} 天）
        </Typography>
        <Card elevation={2} sx={{ mb: 4, p: 2 }}>
          <Stack spacing={0.8}>
            {weightHistory.map((w, i) => {
              const pct = ((w.weight - minW) / (maxW - minW)) * 100;
              const prev = i > 0 ? weightHistory[i - 1].weight : null;
              const diff = prev !== null ? w.weight - prev : null;
              return (
                <Box
                  key={w.date}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Typography
                    variant="caption"
                    sx={{ width: 40, flexShrink: 0 }}
                  >
                    {w.date}
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: 22,
                      bgcolor: "grey.100",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${Math.max(pct, 8)}%`,
                        height: "100%",
                        bgcolor: "primary.main",
                        borderRadius: 1,
                        transition: "width 0.3s",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ width: 60, textAlign: "right", flexShrink: 0 }}
                  >
                    {w.weight} kg
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ width: 50, textAlign: "right", flexShrink: 0 }}
                    color={
                      diff === null
                        ? "text.disabled"
                        : diff <= 0
                          ? "success.main"
                          : "error.main"
                    }
                  >
                    {diff === null
                      ? "—"
                      : diff <= 0
                        ? `↓${Math.abs(diff).toFixed(1)}`
                        : `↑${diff.toFixed(1)}`}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Card>

        {/* ── 今日记录列表 ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            📝 今日记录
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            新增记录
          </Button>
        </Box>

        <Stack spacing={1.5} sx={{ mb: 4 }}>
          {todayRecords.length === 0 && (
            <Typography color="text.secondary" textAlign="center" py={4}>
              暂无记录，点击右下角按钮添加
            </Typography>
          )}
          {todayRecords.map((r) => (
            <Card key={r.id} elevation={1}>
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <AccessTimeIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ width: 45, flexShrink: 0 }}
                  >
                    {formatTime(r.time)}
                  </Typography>
                  <Chip
                    size="small"
                    icon={
                      r.type === "food" ? (
                        <RestaurantIcon />
                      ) : (
                        <FitnessCenterIcon />
                      )
                    }
                    label={r.type === "food" ? "饮食" : "运动"}
                    color={r.type === "food" ? "primary" : "warning"}
                    variant="outlined"
                    sx={{ width: 80 }}
                  />
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    {r.description}
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={r.type === "food" ? "primary.main" : "warning.main"}
                  >
                    {r.type === "food" ? "+" : "-"}
                    {r.calories} kcal
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRecord(r.id)}
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        {/* ── 昨日记录 ── */}
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          昨日记录
        </Typography>
        <Stack spacing={1} sx={{ mb: 4, opacity: 0.75 }}>
          {yesterdayRecords.map((r) => (
            <Card key={r.id} elevation={0} variant="outlined">
              <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ width: 45, flexShrink: 0 }}
                  >
                    {formatTime(r.time)}
                  </Typography>
                  <Chip
                    size="small"
                    label={r.type === "food" ? "饮食" : "运动"}
                    color={r.type === "food" ? "primary" : "warning"}
                    variant="outlined"
                    sx={{ width: 65 }}
                  />
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {r.description}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    {r.type === "food" ? "+" : "-"}
                    {r.calories} kcal
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>

      {/* ── 浮动按钮 ── */}
      <Fab
        color="primary"
        aria-label="新增记录"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={() => setCreateOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* ── 弹窗 ── */}
      <CreateRecordDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleAddRecord}
      />
      <ProfileDialog
        key={String(profileOpen)}
        open={profileOpen}
        profile={profile}
        onClose={() => setProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      {/* 体重更新弹窗 */}
      <Dialog
        open={weightOpen}
        onClose={() => setWeightOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>更新体重</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            当前体重: {profile.weight} kg（每日选取最后一条记录作为当日体重）
          </Typography>
          <TextField
            autoFocus
            label="新体重 (kg)"
            type="number"
            fullWidth
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            slotProps={{ htmlInput: { step: 0.1 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWeightOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleUpdateWeight}>
            确认
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
