"use client";

import { useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import Typography from "@mui/material/Typography";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import Box from "@mui/material/Box";
import type { ImageNutritionFood } from "@/types/calorie";
import { analyzeImageNutrition } from "@/services/imageAnalysisService";
import { RECORD_IMAGE_ACCEPT } from "@/services/imagePreprocessService";
import ImageAttachmentField from "@/components/ImageAttachmentField";
import { useImageAttachment } from "@/hooks/useImageAttachment";
import { useState } from "react";

interface AnalyzedResult {
  title: string;
  calories: number;
  foods: ImageNutritionFood[];
}

export interface ImageUploadAnalyzerRef {
  triggerFileSelect: () => void;
  resolveImages: () => Promise<string[]>;
  clearImage: () => void;
}

interface Props {
  token: string;
  onAnalyzed: (result: AnalyzedResult) => void;
  onClear?: () => void;
  initialImageUrl?: string | null;
}

const ImageUploadAnalyzer = forwardRef<ImageUploadAnalyzerRef, Props>(
  function ImageUploadAnalyzer(
    { token, onAnalyzed, onClear, initialImageUrl },
    ref,
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [foods, setFoods] = useState<ImageNutritionFood[] | null>(null);
    const attachment = useImageAttachment({
      initialRemoteUrl: initialImageUrl ?? null,
    });

    useImperativeHandle(ref, () => ({
      triggerFileSelect: () => inputRef.current?.click(),
      resolveImages: async () => {
        const uploadedUrl = await attachment.uploadIfNeeded(token);
        return uploadedUrl ? [uploadedUrl] : [];
      },
      clearImage: () => {
        attachment.clear();
        setFoods(null);
      },
    }));

    const handleFileSelect = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFoods(null);

        try {
          await attachment.selectFile(selected);
        } catch {
          if (inputRef.current) inputRef.current.value = "";
        }
      },
      [attachment],
    );

    const handleAnalyze = useCallback(async () => {
      if (!attachment.file) return;
      setAnalyzing(true);
      attachment.setError(null);
      try {
        const res = await analyzeImageNutrition(token, attachment.file);
        if (!res.foods?.length) {
          attachment.setError("未识别到食物，请手动填写");
          return;
        }

        setFoods(res.foods);

        const title = res.foods.map((f) => f.name).join(" + ");
        const calories = res.foods.reduce((sum, f) => sum + f.calories, 0);
        onAnalyzed({ title, calories, foods: res.foods });
      } catch (e) {
        attachment.setError(
          e instanceof Error ? e.message : "分析失败，请重试或手动填写",
        );
      } finally {
        setAnalyzing(false);
      }
    }, [attachment, token, onAnalyzed]);

    const handleClear = useCallback(() => {
      attachment.clear();
      setFoods(null);
      if (inputRef.current) inputRef.current.value = "";
      onClear?.();
    }, [attachment, onClear]);

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <input
          ref={inputRef}
          type="file"
          accept={RECORD_IMAGE_ACCEPT}
          onChange={handleFileSelect}
          hidden
        />

        <ImageAttachmentField
          imageUrl={attachment.displayUrl}
          preparing={attachment.preparing}
          uploading={attachment.uploading}
          error={attachment.error}
          emptyText="点击上传食物图片，AI 自动识别营养成分"
          onPick={() => inputRef.current?.click()}
          onClear={handleClear}
          action={
            foods
              ? undefined
              : {
                  label: "AI 分析",
                  loadingLabel: "分析中...",
                  loading: analyzing,
                  disabled: !attachment.file,
                  onClick: handleAnalyze,
                  icon: <AutoFixHighIcon />,
                }
          }
        />

        {/* 分析结果明细（多食物项时显示） */}
        {foods && foods.length > 1 && (
          <Box
            sx={{
              bgcolor: "rgba(61,107,79,0.06)",
              borderRadius: 1.5,
              p: 1.5,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              识别到 {foods.length} 种食物：
            </Typography>
            {foods.map((f, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.25,
                }}
              >
                <Typography variant="body2">{f.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(f.calories)} kcal
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  },
);

export default ImageUploadAnalyzer;
