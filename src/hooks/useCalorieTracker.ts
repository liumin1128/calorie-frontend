"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCalorieStore } from "@/stores/calorieStore";
import { useDailySummaryStore } from "@/stores/dailySummaryStore";
import type {
  CalorieEntry,
  CalorieType,
  CreateCalorieEntryDto,
} from "@/types/calorie";

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
  selectorOpen: boolean;
  lockedType: CalorieType | null;
  autoTriggerImage: boolean;
  aiPreviewOpen: boolean;
  loadEntries: () => Promise<void>;
  handleSubmitRecord: (data: CreateCalorieEntryDto) => Promise<void>;
  handleBatchSubmitRecords: (records: CreateCalorieEntryDto[]) => Promise<void>;
  handleDeleteRecord: (id: string) => Promise<void>;
  handleOpenCreate: () => void;
  handleOpenEdit: (entry: CalorieEntry) => void;
  handleCloseDialog: () => void;
  handleOpenSelector: () => void;
  handleCloseSelector: () => void;
  handleSelectEntryType: (
    type: "ai-image" | "qr-code" | "manual-diet" | "exercise",
  ) => void;
  handleCloseAiPreview: () => void;
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
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [lockedType, setLockedType] = useState<CalorieType | null>(null);
  const [autoTriggerImage, setAutoTriggerImage] = useState(false);
  const [aiPreviewOpen, setAiPreviewOpen] = useState(false);

  const loadEntries = async () => {
    if (!token) return;
    await fetchEntries(token, { force: true });
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
    refreshCalendar(token, { force: true }).catch(() => {});
  };

  const handleBatchSubmitRecords = async (records: CreateCalorieEntryDto[]) => {
    if (!token) return;
    for (const record of records) {
      await addEntry(token, record);
    }
    refreshCalendar(token, { force: true }).catch(() => {});
  };

  const handleDeleteRecord = async (id: string) => {
    if (!token) return;
    await removeEntry(token, id);
    refreshCalendar(token, { force: true }).catch(() => {});
  };

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setLockedType(null);
    setAutoTriggerImage(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (entry: CalorieEntry) => {
    setEditingEntry(entry);
    setLockedType(null);
    setAutoTriggerImage(false);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setLockedType(null);
    setAutoTriggerImage(false);
  };

  const handleOpenSelector = () => {
    setSelectorOpen(true);
  };

  const handleCloseSelector = () => {
    setSelectorOpen(false);
  };

  const handleCloseAiPreview = () => {
    setAiPreviewOpen(false);
  };

  const handleSelectEntryType = (
    entryType: "ai-image" | "qr-code" | "manual-diet" | "exercise",
  ) => {
    setSelectorOpen(false);
    setEditingEntry(null);
    switch (entryType) {
      case "ai-image":
        setAiPreviewOpen(true);
        break;
      case "manual-diet":
        setLockedType("intake");
        setAutoTriggerImage(false);
        setDialogOpen(true);
        break;
      case "exercise":
        setLockedType("burn");
        setAutoTriggerImage(false);
        setDialogOpen(true);
        break;
      // "qr-code" 不做处理，面板已 disabled
    }
  };

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
    selectorOpen,
    lockedType,
    autoTriggerImage,
    aiPreviewOpen,
    loadEntries,
    handleSubmitRecord,
    handleBatchSubmitRecords,
    handleDeleteRecord,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
    handleOpenSelector,
    handleCloseSelector,
    handleSelectEntryType,
    handleCloseAiPreview,
  };
}
