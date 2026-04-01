"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCalorieStore } from "@/stores/calorieStore";
import { useDailySummaryStore } from "@/stores/dailySummaryStore";
import type { CalorieEntry, CreateCalorieEntryDto } from "@/types/calorie";

export interface UseCalorieTrackerReturn {
  entries: CalorieEntry[];
  loading: boolean;
  error: string | null;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  dialogOpen: boolean;
  editingEntry: CalorieEntry | null;
  profileOpen: boolean;
  setProfileOpen: (open: boolean) => void;
  loadEntries: () => Promise<void>;
  handleSubmitRecord: (data: CreateCalorieEntryDto) => Promise<void>;
  handleDeleteRecord: (id: string) => Promise<void>;
  handleOpenCreate: () => void;
  handleOpenEdit: (entry: CalorieEntry) => void;
  handleCloseDialog: () => void;
}

export function useCalorieTracker(): UseCalorieTrackerReturn {
  const { token } = useAuth();

  const entries = useCalorieStore((s) => s.entries);
  const loading = useCalorieStore((s) => s.loading);
  const error = useCalorieStore((s) => s.error);
  const selectedDate = useCalorieStore((s) => s.selectedDate);
  const storeSetSelectedDate = useCalorieStore((s) => s.setSelectedDate);
  const fetchEntries = useCalorieStore((s) => s.fetchEntries);
  const addEntry = useCalorieStore((s) => s.addEntry);
  const editEntry = useCalorieStore((s) => s.editEntry);
  const removeEntry = useCalorieStore((s) => s.removeEntry);
  const refreshCalendar = useDailySummaryStore((s) => s.fetchSummary);

  // UI-only state stays local
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalorieEntry | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const loadEntries = async () => {
    if (!token) return;
    await fetchEntries(token);
  };

  useEffect(() => {
    if (token) fetchEntries(token);
  }, [token, selectedDate, fetchEntries]);

  const setSelectedDate = (date: string) => {
    storeSetSelectedDate(date);
  };

  const handleSubmitRecord = async (data: CreateCalorieEntryDto) => {
    if (!token) return;
    if (editingEntry) {
      await editEntry(token, editingEntry._id, data);
    } else {
      await addEntry(token, data);
    }
    refreshCalendar(token, { force: true });
  };

  const handleDeleteRecord = async (id: string) => {
    if (!token) return;
    await removeEntry(token, id);
    refreshCalendar(token, { force: true });
  };

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (entry: CalorieEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  return {
    entries,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    dialogOpen,
    editingEntry,
    profileOpen,
    setProfileOpen,
    loadEntries,
    handleSubmitRecord,
    handleDeleteRecord,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
  };
}
