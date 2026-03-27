"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCalorieEntries,
  createCalorieEntry,
  updateCalorieEntry,
  deleteCalorieEntry,
} from "@/services/calorieService";
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

  const [entries, setEntries] = useState<CalorieEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CalorieEntry | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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
