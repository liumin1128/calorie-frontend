"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import { useUserProfile } from "@/contexts/UserProfileContext";
import { calculateBMR } from "@/types/calorie";
import { calculateAge } from "@/types/user";
import { sumCalories } from "@/utils/calorie";
import { useCalorieTracker } from "@/hooks/useCalorieTracker";
import ProfileSummaryCard from "@/components/ProfileSummaryCard";
import CalorieStatsGrid from "@/components/CalorieStatsGrid";
import CalorieRecordList from "@/components/CalorieRecordList";
import CreateRecordDialog from "@/components/CreateRecordDialog";
import ProfileDialog from "@/components/ProfileDialog";

export default function Home() {
  const { profile, loading: profileLoading } = useUserProfile();
  const tracker = useCalorieTracker();

  // 派生统计数据
  const intake = sumCalories(tracker.entries, "intake");
  const burn = sumCalories(tracker.entries, "burn");
  const height = profile?.latestHeight?.value ?? 0;
  const weight = profile?.latestWeight?.value ?? 0;
  const gender =
    profile?.gender === "female" ? ("female" as const) : ("male" as const);
  const age = profile?.birthday ? calculateAge(profile.birthday) : 0;
  const hasProfile = !!profile && height > 0 && weight > 0 && age > 0;
  const bmr = hasProfile ? calculateBMR({ age, height, weight, gender }) : 0;

  return (
    <Box sx={{ flexGrow: 1, pb: 10 }}>
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <ProfileSummaryCard
          profile={profile}
          profileLoading={profileLoading}
          onOpenProfile={() => tracker.setProfileOpen(true)}
        />
        <CalorieStatsGrid intake={intake} burn={burn} bmr={bmr} />
        <CalorieRecordList
          entries={tracker.entries}
          loading={tracker.loading}
          error={tracker.error}
          selectedDate={tracker.selectedDate}
          onSelectedDateChange={tracker.setSelectedDate}
          onEdit={tracker.handleOpenEdit}
          onDelete={tracker.handleDeleteRecord}
          onRetry={tracker.loadEntries}
          onOpenCreate={tracker.handleOpenCreate}
        />
      </Container>

      <Fab
        color="primary"
        aria-label="新增记录"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        onClick={tracker.handleOpenCreate}
      >
        <AddIcon />
      </Fab>

      <CreateRecordDialog
        open={tracker.dialogOpen}
        onClose={tracker.handleCloseDialog}
        onSubmit={tracker.handleSubmitRecord}
        initialData={tracker.editingEntry}
        defaultDate={tracker.selectedDate}
      />
      <ProfileDialog
        open={tracker.profileOpen}
        onClose={() => tracker.setProfileOpen(false)}
      />
    </Box>
  );
}
