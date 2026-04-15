import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";

interface Props {
  onPickCamera: () => void;
  onPickAlbum: () => void;
}

export default function BarcodePickerPanel({
  onPickCamera,
  onPickAlbum,
}: Props) {
  return (
    <>
      <Box
        sx={{
          minHeight: 220,
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "background.default",
          display: "grid",
          placeItems: "center",
          px: 3,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <QrCodeScannerIcon
            sx={{ fontSize: 56, color: "text.disabled", mb: 1.5 }}
          />
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
            拍照后直接识别商品条码
          </Typography>
          <Typography variant="body2" color="text.secondary">
            不再展示扫码中间过程，识别完成后直接显示营养结果。
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
        <Button
          variant="contained"
          startIcon={<CameraAltIcon />}
          onClick={onPickCamera}
          sx={{ flex: 1, borderRadius: 3 }}
        >
          拍照扫描
        </Button>
        <Button
          variant="outlined"
          startIcon={<PhotoLibraryIcon />}
          onClick={onPickAlbum}
          sx={{ flex: 1, borderRadius: 3 }}
        >
          相册选图
        </Button>
      </Stack>
    </>
  );
}
