"use client";

import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCalorieStore } from "@/stores/calorieStore";
import { useDailySummaryStore } from "@/stores/dailySummaryStore";
import { lookupBarcodeNutrition } from "@/services/barcodeNutritionService";
import { getCalorieEntryComment } from "@/services/calorieService";
import type {
  BarcodeNutritionPreview,
  CalorieEntry,
  CalorieType,
  CreateCalorieEntryDto,
} from "@/types/calorie";
import { getDefaultMealType } from "@/types/calorie";

function buildBarcodeEntryDto(
  preview: BarcodeNutritionPreview,
  selectedDate: string,
): CreateCalorieEntryDto {
  const description = [preview.brand, preview.servingText]
    .filter(Boolean)
    .join(" · ");

  return {
    type: "intake",
    title: preview.name,
    calories: preview.entryCalories ?? preview.calories ?? 0,
    entryDate: new Date(
      `${selectedDate}T${new Date().toTimeString().slice(0, 5)}`,
    ).toISOString(),
    mealType: getDefaultMealType(),
    source: "barcode",
    ...(preview.entryWater != null ? { water: preview.entryWater } : {}),
    ...(description ? { description } : {}),
    ...(preview.entryNutrition ? { nutrition: preview.entryNutrition } : {}),
    ...(preview.entryMinerals ? { minerals: preview.entryMinerals } : {}),
  };
}

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
  qrScannerOpen: boolean;
  barcodePreviewLoading: boolean;
  barcodePreviewSubmitting: boolean;
  barcodePreviewError: string | null;
  barcodePreviewData: BarcodeNutritionPreview | null;
  recentIntakeComment: string | null;
  recentIntakeCommentLoading: boolean;
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
  handleCloseQrScanner: () => void;
  handleDetectedBarcode: (result: {
    text: string;
    format: string;
  }) => Promise<void>;
  handleCloseBarcodePreview: () => void;
  handleRetryBarcodeScan: () => void;
  handleConfirmBarcodePreview: () => Promise<void>;
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
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [barcodePreviewLoading, setBarcodePreviewLoading] = useState(false);
  const [barcodePreviewSubmitting, setBarcodePreviewSubmitting] =
    useState(false);
  const [barcodePreviewError, setBarcodePreviewError] = useState<string | null>(
    null,
  );
  const [barcodePreviewData, setBarcodePreviewData] =
    useState<BarcodeNutritionPreview | null>(null);
  const [recentIntakeComment, setRecentIntakeComment] = useState<string | null>(
    null,
  );
  const [recentIntakeCommentLoading, setRecentIntakeCommentLoading] =
    useState(false);
  const barcodeLookupIdRef = useRef(0);

  const resetRecentIntakeComment = () => {
    setRecentIntakeComment(null);
    setRecentIntakeCommentLoading(false);
  };

  const resetBarcodePreviewState = () => {
    barcodeLookupIdRef.current += 1;
    setBarcodePreviewLoading(false);
    setBarcodePreviewSubmitting(false);
    setBarcodePreviewError(null);
    setBarcodePreviewData(null);
  };

  const loadEntries = async () => {
    if (!token) return;
    await fetchEntries(token, { force: true });
  };

  useEffect(() => {
    if (token) fetchEntries(token);
  }, [token, selectedDate, fetchEntries]);

  useEffect(() => {
    resetRecentIntakeComment();
  }, [selectedDate]);

  const setSelectedDate = (date: string) => {
    storeSetSelectedDate(date);
  };

  const handleSubmitRecord = async (data: CreateCalorieEntryDto) => {
    if (!token) return;
    if (editingEntry) {
      await editEntry(token, editingEntry._id, data);
      refreshCalendar(token, { force: true }).catch(() => {});
      return;
    }

    if (data.type === "intake") {
      resetRecentIntakeComment();
    }

    const createdEntry = await addEntry(token, data);
    refreshCalendar(token, { force: true }).catch(() => {});

    if (data.type !== "intake") {
      return;
    }

    setRecentIntakeCommentLoading(true);

    getCalorieEntryComment(token, createdEntry._id)
      .then(({ comment }) => {
        setRecentIntakeComment(comment);
      })
      .catch(() => {
        setRecentIntakeComment(null);
      })
      .finally(() => {
        setRecentIntakeCommentLoading(false);
      });
  };

  const handleBatchSubmitRecords = async (records: CreateCalorieEntryDto[]) => {
    if (!token) return;
    await Promise.all(records.map((record) => addEntry(token, record)));
    refreshCalendar(token, { force: true }).catch(() => {});
  };

  const handleDeleteRecord = async (id: string) => {
    if (!token) return;
    await removeEntry(token, id);
    refreshCalendar(token, { force: true }).catch(() => {});
  };

  const handleOpenCreate = () => {
    resetBarcodePreviewState();
    setEditingEntry(null);
    setLockedType(null);
    setAutoTriggerImage(false);
    setDialogOpen(true);
  };

  const handleOpenEdit = (entry: CalorieEntry) => {
    resetBarcodePreviewState();
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
    resetBarcodePreviewState();
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
      case "qr-code":
        setQrScannerOpen(true);
        break;
    }
  };

  const handleDetectedBarcode = async ({ text }: { text: string }) => {
    if (!token) return;

    const requestId = barcodeLookupIdRef.current + 1;
    barcodeLookupIdRef.current = requestId;
    setQrScannerOpen(true);
    setBarcodePreviewLoading(true);
    setBarcodePreviewSubmitting(false);
    setBarcodePreviewError(null);
    setBarcodePreviewData(null);

    try {
      const preview = await lookupBarcodeNutrition(token, text);
      if (barcodeLookupIdRef.current !== requestId) return;
      setBarcodePreviewData(preview);
    } catch (error) {
      if (barcodeLookupIdRef.current !== requestId) return;
      setBarcodePreviewError(
        error instanceof Error ? error.message : "查询条码营养信息失败",
      );
    } finally {
      if (barcodeLookupIdRef.current === requestId) {
        setBarcodePreviewLoading(false);
      }
    }
  };

  const handleCloseBarcodePreview = () => {
    resetBarcodePreviewState();
    setQrScannerOpen(false);
  };

  const handleRetryBarcodeScan = () => {
    resetBarcodePreviewState();
    setQrScannerOpen(true);
  };

  const handleConfirmBarcodePreview = async () => {
    if (!barcodePreviewData || !token) return;

    if (
      barcodePreviewData.calories == null ||
      barcodePreviewData.calories < 0
    ) {
      setBarcodePreviewError(
        "该商品缺少可记录的热量信息，暂时无法直接添加到记录",
      );
      return;
    }

    setBarcodePreviewSubmitting(true);
    setBarcodePreviewError(null);
    try {
      await handleSubmitRecord(
        buildBarcodeEntryDto(barcodePreviewData, selectedDate),
      );
      resetBarcodePreviewState();
      setQrScannerOpen(false);
    } catch (error) {
      setBarcodePreviewError(
        error instanceof Error ? error.message : "添加条码记录失败",
      );
    } finally {
      setBarcodePreviewSubmitting(false);
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
    qrScannerOpen,
    barcodePreviewLoading,
    barcodePreviewSubmitting,
    barcodePreviewError,
    barcodePreviewData,
    recentIntakeComment,
    recentIntakeCommentLoading,
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
    handleCloseQrScanner: () => {
      resetBarcodePreviewState();
      setQrScannerOpen(false);
    },
    handleDetectedBarcode,
    handleCloseBarcodePreview,
    handleRetryBarcodeScan,
    handleConfirmBarcodePreview,
  };
}
