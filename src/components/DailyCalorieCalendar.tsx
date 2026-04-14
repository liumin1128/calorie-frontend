"use client";

import { useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import { useAuth } from "@/contexts/AuthContext";
import { useCalorieStore } from "@/stores/calorieStore";
import { useDailySummaryStore } from "@/stores/dailySummaryStore";
import CalorieRing from "@/components/CalorieRing";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

/** 构建日历网格：返回 6 行 × 7 列的日期数组，非当月日期为 null */
function buildCalendarGrid(month: string): (number | null)[][] {
  const d = dayjs(month);
  const daysInMonth = d.daysInMonth();
  // dayjs().day(): 0=Sun, 1=Mon ... 6=Sat → 转为周一起始: (day + 6) % 7
  const firstDayOffset = (d.startOf("month").day() + 6) % 7;

  const grid: (number | null)[][] = [];
  let day = 1;
  for (let row = 0; row < 6; row++) {
    const week: (number | null)[] = [];
    for (let col = 0; col < 7; col++) {
      const idx = row * 7 + col;
      if (idx < firstDayOffset || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day++);
      }
    }
    grid.push(week);
    if (day > daysInMonth) break;
  }
  return grid;
}

export default function DailyCalorieCalendar() {
  const { token } = useAuth();
  const selectedDate = useCalorieStore((s) => s.selectedDate);
  const setSelectedDate = useCalorieStore((s) => s.setSelectedDate);
  const currentMonth = useDailySummaryStore((s) => s.currentMonth);
  const summaryMap = useDailySummaryStore((s) => s.summaryMap);
  const loading = useDailySummaryStore((s) => s.loading);
  const error = useDailySummaryStore((s) => s.error);
  const fetchSummary = useDailySummaryStore((s) => s.fetchSummary);
  const setMonth = useDailySummaryStore((s) => s.setMonth);

  const isCurrentMonth = currentMonth === dayjs().format("YYYY-MM");

  useEffect(() => {
    if (token) fetchSummary(token);
  }, [token, currentMonth, fetchSummary]);

  const grid = useMemo(() => buildCalendarGrid(currentMonth), [currentMonth]);

  const handlePrev = () => {
    const prev = dayjs(currentMonth).subtract(1, "month").format("YYYY-MM");
    setMonth(prev);
  };

  const handleNext = () => {
    if (isCurrentMonth) return;
    const next = dayjs(currentMonth).add(1, "month").format("YYYY-MM");
    setMonth(next);
  };

  const title = dayjs(currentMonth).format("YYYY年M月");
  const today = dayjs().date();

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarMonthIcon color="primary" />
            <Typography variant="h6" component="h2">
              每日卡路里
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton size="small" onClick={handlePrev}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography
              variant="subtitle1"
              sx={{ minWidth: 100, textAlign: "center" }}
            >
              {title}
            </Typography>
            <IconButton
              size="small"
              onClick={handleNext}
              disabled={isCurrentMonth}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <>
            {/* Weekday headers */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 0.5,
                mb: 0.5,
              }}
            >
              {WEEKDAYS.map((w) => (
                <Typography
                  key={w}
                  variant="caption"
                  sx={{
                    textAlign: "center",
                    fontWeight: "bold",
                    color: "text.secondary",
                  }}
                >
                  {w}
                </Typography>
              ))}
            </Box>

            {/* Calendar grid */}
            {grid.map((week, ri) => (
              <Box
                key={ri}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 0.5,
                }}
              >
                {week.map((day, ci) => {
                  if (day === null) {
                    return <Box key={ci} />;
                  }
                  const dateKey = dayjs(currentMonth)
                    .date(day)
                    .format("YYYY-MM-DD");
                  const item = summaryMap[dateKey];
                  const total =
                    (item?.totalIntake ?? 0) + (item?.totalBurn ?? 0);
                  const isToday = isCurrentMonth && day === today;
                  const isSelected = dateKey === selectedDate;
                  const isFuture = dayjs(dateKey).isAfter(dayjs(), "day");

                  return (
                    <Box
                      key={ci}
                      onClick={() => !isFuture && setSelectedDate(dateKey)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        py: 0.5,
                        cursor: isFuture ? "default" : "pointer",
                        borderRadius: 1,
                        bgcolor: isSelected ? "primary.50" : "transparent",
                        "&:hover": isFuture ? {} : { bgcolor: "action.hover" },
                      }}
                    >
                      <CalorieRing
                        value={total}
                        max={1000}
                        size={36}
                        strokeWidth={3}
                        color={
                          isSelected
                            ? "primary.main"
                            : isToday
                              ? "primary.main"
                              : "success.main"
                        }
                        trackColor={
                          isSelected || isToday ? "primary.100" : undefined
                        }
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight:
                              isSelected || isToday ? "bold" : "normal",
                            color:
                              isSelected || isToday
                                ? "primary.main"
                                : "text.primary",
                            lineHeight: 1,
                            zIndex: 1,
                          }}
                        >
                          {day}
                        </Typography>
                      </CalorieRing>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
