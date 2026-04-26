"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Fab from "@mui/material/Fab";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { useMemo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import dynamic from "next/dynamic";

const DatePicker = dynamic(
  () =>
    import("@mui/x-date-pickers/DatePicker").then((m) => ({
      default: m.DatePicker,
    })),
  { ssr: false },
);
import { useUserProfile } from "@/contexts/UserProfileContext";
import { useAuth } from "@/contexts/AuthContext";
import { calculateBMR } from "@/types/calorie";
import { calculateAge } from "@/types/user";
import { sumCalories } from "@/utils/calorie";
import { useCalorieTracker } from "@/hooks/useCalorieTracker";
import ProfileSummaryCard from "@/components/ProfileSummaryCard";
import CalorieStatsGrid from "@/components/CalorieStatsGrid";
import CalorieRecordList from "@/components/CalorieRecordList";
import DailyCalorieCalendar from "@/components/DailyCalorieCalendar";
import WaterIntakeCard from "@/components/WaterIntakeCard";
import CalorieRing from "@/components/CalorieRing";
import FadeUp from "@/components/FadeUp";

const CreateRecordDialog = dynamic(
  () => import("@/components/CreateRecordDialog"),
  { ssr: false },
);
const ProfileDialog = dynamic(() => import("@/components/ProfileDialog"), {
  ssr: false,
});
const RecordTypeSelector = dynamic(
  () => import("@/components/RecordTypeSelector"),
  { ssr: false },
);
const AiAnalysisPreview = dynamic(
  () => import("@/components/AiAnalysisPreview"),
  { ssr: false },
);
const BarcodeScanner = dynamic(() => import("@/components/BarcodeScanner"), {
  ssr: false,
});

export default function Home() {
  const { profile, loading: profileLoading } = useUserProfile();
  const { token } = useAuth();
  const tracker = useCalorieTracker();

  const intake = sumCalories(tracker.entries, "intake");
  const burn = sumCalories(tracker.entries, "burn");
  const height = profile?.latestHeight?.value ?? 0;
  const weight = profile?.latestWeight?.value ?? 0;
  const gender =
    profile?.gender === "female" ? ("female" as const) : ("male" as const);
  const age = profile?.birthday ? calculateAge(profile.birthday) : 0;
  const hasProfile = !!profile && height > 0 && weight > 0 && age > 0;
  const bmr = hasProfile ? calculateBMR({ age, height, weight, gender }) : 0;
  const net = intake - burn;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "早上好" : hour < 18 ? "下午好" : "晚上好";
  }, []);
  const isToday = tracker.selectedDate === dayjs().format("YYYY-MM-DD");

  return (
    <Box sx={{ flexGrow: 1, pb: 10 }}>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* 左栏：主体内容 */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={3}>
              {/* Hero Card */}
              <FadeUp>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                    <Stack spacing={3}>
                      {/* Greeting + DatePicker */}
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            variant="h5"
                            fontWeight="bold"
                            gutterBottom
                          >
                            {greeting}，{profile?.nickname || "你好"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {isToday
                              ? "今日饮食概览"
                              : `${tracker.selectedDate} 概览`}
                          </Typography>
                        </Box>
                        <DatePicker
                          value={dayjs(tracker.selectedDate)}
                          onChange={(v: Dayjs | null) =>
                            v && tracker.setSelectedDate(v.format("YYYY-MM-DD"))
                          }
                          disableFuture
                          slotProps={{
                            textField: { size: "small", sx: { width: 150 } },
                          }}
                        />
                      </Stack>

                      {/* Hero Calorie Ring */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <CalorieRing
                          value={intake}
                          max={bmr || 2000}
                          size={160}
                          strokeWidth={10}
                        >
                          <Stack alignItems="center" sx={{ zIndex: 1 }}>
                            <Typography
                              variant="h4"
                              fontWeight="bold"
                              color="primary.main"
                              sx={{ lineHeight: 1.1 }}
                            >
                              {Math.round(net)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              净卡路里
                            </Typography>
                          </Stack>
                        </CalorieRing>
                      </Box>

                      {/* Mini Stats */}
                      <CalorieStatsGrid intake={intake} burn={burn} bmr={bmr} />
                    </Stack>
                  </CardContent>
                </Card>
              </FadeUp>

              {/* Records */}
              <FadeUp delay="0.15s">
                <CalorieRecordList
                  entries={tracker.entries}
                  loading={tracker.loading}
                  error={tracker.error}
                  selectedDate={tracker.selectedDate}
                  recentIntakeComment={tracker.recentIntakeComment}
                  recentIntakeCommentLoading={
                    tracker.recentIntakeCommentLoading
                  }
                  onEdit={tracker.handleOpenEdit}
                  onDelete={tracker.handleDeleteRecord}
                  onRetry={tracker.loadEntries}
                  onOpenCreate={tracker.handleOpenCreate}
                  onSelectEntryType={tracker.handleSelectEntryType}
                />
              </FadeUp>
            </Stack>
          </Grid>

          {/* 右栏 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <FadeUp delay="0.2s">
              <Stack spacing={2} sx={{ height: "auto" }}>
                <ProfileSummaryCard
                  profile={profile}
                  profileLoading={profileLoading}
                  onOpenProfile={() => tracker.setProfileOpen(true)}
                />
                <WaterIntakeCard />
                <DailyCalorieCalendar />
              </Stack>
            </FadeUp>
          </Grid>
        </Grid>
      </Container>

      <Fab
        color="primary"
        aria-label="新增记录"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={tracker.handleOpenSelector}
      >
        <AddIcon />
      </Fab>

      <RecordTypeSelector
        open={tracker.selectorOpen}
        onClose={tracker.handleCloseSelector}
        onSelect={tracker.handleSelectEntryType}
      />

      <CreateRecordDialog
        open={tracker.dialogOpen}
        onClose={tracker.handleCloseDialog}
        onSubmit={tracker.handleSubmitRecord}
        initialData={tracker.editingEntry}
        defaultDate={tracker.selectedDate}
        lockedType={tracker.lockedType}
        autoTriggerImage={tracker.autoTriggerImage}
      />

      {token && (
        <AiAnalysisPreview
          open={tracker.aiPreviewOpen}
          token={token}
          selectedDate={tracker.selectedDate}
          onClose={tracker.handleCloseAiPreview}
          onSave={tracker.handleBatchSubmitRecords}
        />
      )}

      <ProfileDialog
        open={tracker.profileOpen}
        onClose={() => tracker.setProfileOpen(false)}
      />

      <BarcodeScanner
        open={tracker.qrScannerOpen}
        loading={tracker.barcodePreviewLoading}
        submitting={tracker.barcodePreviewSubmitting}
        error={tracker.barcodePreviewError}
        preview={tracker.barcodePreviewData}
        imageUrl={tracker.barcodeImagePreviewUrl}
        onClose={tracker.handleCloseBarcodePreview}
        onDetected={tracker.handleDetectedBarcode}
        onFileSelected={tracker.handleBarcodeFileSelected}
        onRetryScan={tracker.handleRetryBarcodeScan}
        onConfirm={tracker.handleConfirmBarcodePreview}
      />
    </Box>
  );
}
