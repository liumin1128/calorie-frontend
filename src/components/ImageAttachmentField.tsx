"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloseIcon from "@mui/icons-material/Close";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";

interface Props {
  imageUrl: string | null;
  preparing?: boolean;
  uploading?: boolean;
  error?: string | null;
  emptyText?: string;
  onPick: () => void;
  onClear?: () => void;
  action?: {
    label: string;
    loadingLabel?: string;
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
  };
}

export default function ImageAttachmentField({
  imageUrl,
  preparing = false,
  uploading = false,
  error,
  emptyText = "点击上传图片",
  onPick,
  onClear,
  action,
}: Props) {
  const busy = preparing || uploading;

  return (
    <Stack spacing={1.25}>
      {!imageUrl ? (
        <Box
          onClick={() => !busy && onPick()}
          sx={{
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            cursor: busy ? "default" : "pointer",
            opacity: busy ? 0.72 : 1,
            transition: "border-color 0.2s, background-color 0.2s",
            "&:hover": busy
              ? undefined
              : {
                  borderColor: "primary.light",
                  bgcolor: "rgba(61,107,79,0.04)",
                },
          }}
        >
          {busy ? (
            <CircularProgress size={28} sx={{ color: "primary.main" }} />
          ) : (
            <CameraAltIcon sx={{ fontSize: 32, color: "text.secondary" }} />
          )}
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {preparing
              ? "正在优化图片，请稍候..."
              : uploading
                ? "正在上传图片，请稍候..."
                : emptyText}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: "relative" }}>
          <Box
            component="img"
            src={imageUrl}
            alt="图片预览"
            sx={{
              width: "100%",
              maxHeight: 220,
              objectFit: "cover",
              borderRadius: 2,
              display: "block",
              border: "1px solid",
              borderColor: "divider",
            }}
          />

          {onClear ? (
            <IconButton
              size="small"
              onClick={onClear}
              disabled={busy}
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
          ) : null}

          {action ? (
            <Button
              variant="contained"
              size="small"
              startIcon={
                action.loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  (action.icon ?? <ImageSearchIcon />)
                )
              }
              disabled={busy || action.disabled || action.loading}
              onClick={action.onClick}
              sx={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {action.loading
                ? (action.loadingLabel ?? `${action.label}中...`)
                : action.label}
            </Button>
          ) : null}
        </Box>
      )}

      {imageUrl ? (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={onPick} disabled={busy}>
            更换图片
          </Button>
          {uploading ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ alignSelf: "center" }}
            >
              上传中...
            </Typography>
          ) : null}
        </Stack>
      ) : null}

      {error ? (
        <Typography variant="body2" color="error" textAlign="center">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}
