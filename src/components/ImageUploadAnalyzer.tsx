"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import type { ImageNutritionFood } from "@/types/calorie";
import { analyzeImageNutrition } from "@/services/imageAnalysisService";
import {
  AI_IMAGE_ACCEPT,
  prepareImageForAiUpload,
} from "@/services/imagePreprocessService";

interface AnalyzedResult {
  title: string;
  calories: number;
  foods: ImageNutritionFood[];
}

export interface ImageUploadAnalyzerRef {
  triggerFileSelect: () => void;
}

interface Props {
  token: string;
  onAnalyzed: (result: AnalyzedResult) => void;
  onClear?: () => void;
}

const ImageUploadAnalyzer = forwardRef<ImageUploadAnalyzerRef, Props>(
  function ImageUploadAnalyzer({ token, onAnalyzed, onClear }, ref) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [preparing, setPreparing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [foods, setFoods] = useState<ImageNutritionFood[] | null>(null);

    useImperativeHandle(ref, () => ({
      triggerFileSelect: () => inputRef.current?.click(),
    }));

    // 清理 objectURL 防止内存泄漏
    useEffect(() => {
      return () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
      };
    }, [previewUrl]);

    const handleFileSelect = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        // 清理旧预览
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setError(null);
        setFoods(null);
        setPreparing(true);

        try {
          const prepared = await prepareImageForAiUpload(selected);
          setFile(prepared.file);
          setPreviewUrl(prepared.previewUrl);
        } catch (err) {
          setFile(null);
          setPreviewUrl(null);
          setError(err instanceof Error ? err.message : "图片处理失败，请重试");
          if (inputRef.current) inputRef.current.value = "";
        } finally {
          setPreparing(false);
        }
      },
      [previewUrl],
    );

    const handleAnalyze = useCallback(async () => {
      if (!file) return;
      setAnalyzing(true);
      setError(null);
      try {
        const res = await analyzeImageNutrition(token, file);
        if (!res.foods?.length) {
          setError("未识别到食物，请手动填写");
          return;
        }

        setFoods(res.foods);

        const title = res.foods.map((f) => f.name).join(" + ");
        const calories = res.foods.reduce((sum, f) => sum + f.calories, 0);
        onAnalyzed({ title, calories, foods: res.foods });
      } catch (e) {
        setError(e instanceof Error ? e.message : "分析失败，请重试或手动填写");
      } finally {
        setAnalyzing(false);
      }
    }, [file, token, onAnalyzed]);

    const handleClear = useCallback(() => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(null);
      setPreviewUrl(null);
      setError(null);
      setFoods(null);
      if (inputRef.current) inputRef.current.value = "";
      onClear?.();
    }, [previewUrl, onClear]);

    // 暴露 reset 能力供父组件调用
    // 通过 key 重新渲染即可，无需 imperativeHandle

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* 隐藏的 file input */}
        <input
          ref={inputRef}
          type="file"
          accept={AI_IMAGE_ACCEPT}
          onChange={handleFileSelect}
          hidden
        />

        {!previewUrl ? (
          /* 上传占位区域 */
          <Box
            onClick={() => !preparing && inputRef.current?.click()}
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              transition: "border-color 0.2s, background 0.2s",
              opacity: preparing ? 0.7 : 1,
              "&:hover": {
                borderColor: "primary.light",
                bgcolor: "rgba(61,107,79,0.04)",
              },
            }}
          >
            {preparing ? (
              <CircularProgress size={28} sx={{ color: "primary.main" }} />
            ) : (
              <CameraAltIcon sx={{ fontSize: 32, color: "text.secondary" }} />
            )}
            <Typography variant="body2" color="text.secondary">
              {preparing
                ? "正在优化图片，请稍候..."
                : "点击上传食物图片，AI 自动识别营养成分"}
            </Typography>
          </Box>
        ) : (
          /* 图片预览 + 操作 */
          <Box sx={{ position: "relative" }}>
            <Box
              component="img"
              src={previewUrl}
              alt="食物图片预览"
              sx={{
                width: "100%",
                maxHeight: 200,
                objectFit: "cover",
                borderRadius: 2,
                display: "block",
              }}
            />
            {/* 清除按钮 */}
            <IconButton
              size="small"
              onClick={handleClear}
              sx={{
                position: "absolute",
                top: 6,
                right: 6,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "#fff",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {/* 分析按钮 */}
            {!foods && (
              <Button
                variant="contained"
                size="small"
                startIcon={
                  analyzing ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <AutoFixHighIcon />
                  )
                }
                disabled={analyzing || preparing}
                onClick={handleAnalyze}
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                {analyzing ? "分析中..." : "AI 分析"}
              </Button>
            )}
          </Box>
        )}

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

        {/* 错误提示 */}
        {error && (
          <Typography variant="body2" color="error" textAlign="center">
            {error}
          </Typography>
        )}
      </Box>
    );
  },
);

export default ImageUploadAnalyzer;
