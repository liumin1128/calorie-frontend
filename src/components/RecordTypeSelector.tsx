"use client";

import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import EditNoteIcon from "@mui/icons-material/EditNote";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import type { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";

export type RecordEntryType =
  | "ai-image"
  | "qr-code"
  | "manual-diet"
  | "exercise";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (type: RecordEntryType) => void;
}

const SlideUp = forwardRef(function SlideUp(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const entryOptions: {
  type: RecordEntryType;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}[] = [
  {
    type: "ai-image",
    icon: <CameraAltIcon />,
    title: "AI 图片识别",
    description: "拍照或上传食物图片，AI 自动识别",
  },
  {
    type: "qr-code",
    icon: <QrCodeScannerIcon />,
    title: "二维码识别",
    description: "扫描食品包装条码",
    disabled: true,
  },
  {
    type: "manual-diet",
    icon: <EditNoteIcon />,
    title: "手动输入饮食",
    description: "搜索或手动填写饮食记录",
  },
  {
    type: "exercise",
    icon: <FitnessCenterIcon />,
    title: "运动记录",
    description: "记录运动消耗的卡路里",
  },
];

export default function RecordTypeSelector({ open, onClose, onSelect }: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={SlideUp}
      PaperProps={{
        sx: {
          position: "fixed",
          bottom: 0,
          m: 0,
          width: "100%",
          maxWidth: 480,
          borderRadius: "16px 16px 0 0",
          pb: "env(safe-area-inset-bottom, 16px)",
        },
      }}
    >
      <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          添加记录
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          选择记录类型
        </Typography>
      </Box>

      <Box
        sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", gap: 1 }}
      >
        {entryOptions.map((option) => (
          <ButtonBase
            key={option.type}
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled) {
                onSelect(option.type);
                onClose();
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              textAlign: "left",
              width: "100%",
              transition: "all 0.15s",
              opacity: option.disabled ? 0.5 : 1,
              "&:hover": option.disabled
                ? {}
                : {
                    bgcolor: "rgba(61,107,79,0.04)",
                    borderColor: "primary.light",
                  },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: option.disabled
                  ? "rgba(0,0,0,0.04)"
                  : option.type === "exercise"
                    ? "rgba(244,148,32,0.10)"
                    : "rgba(61,107,79,0.08)",
                color: option.disabled
                  ? "text.disabled"
                  : option.type === "exercise"
                    ? "warning.main"
                    : "primary.main",
                flexShrink: 0,
              }}
            >
              {option.icon}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {option.title}
                </Typography>
                {option.disabled && (
                  <Chip
                    label="即将支持"
                    size="small"
                    sx={{ height: 20, fontSize: 11, borderRadius: "999px" }}
                  />
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                {option.description}
              </Typography>
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Dialog>
  );
}
