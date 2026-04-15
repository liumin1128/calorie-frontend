import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function BarcodeLoadingOverlay() {
  return (
    <Box
      sx={(theme) => ({
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        bgcolor: "rgba(250,250,245,0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(61,107,79,0.12)",
        }}
      >
        <CircularProgress size={28} thickness={4.6} />
      </Box>
    </Box>
  );
}
