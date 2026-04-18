import type { Theme } from "@mui/material/styles";

export const authInputSx = {
  "& .MuiInput-underline:before": { borderBottomColor: "divider" },
  "& .MuiInput-underline:after": { borderBottomColor: "primary.main" },
  "& .MuiInputLabel-root": { color: "text.secondary", fontSize: 14 },
  "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
  "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus":
    {
      WebkitBoxShadow: "0 0 0 100px #fafaf5 inset",
      WebkitTextFillColor: "#2a2a2a",
      caretColor: "#2a2a2a",
      transition: "background-color 5000s ease-in-out 0s",
    },
};

export const authPageShellSx = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  bgcolor: "background.default",
};

export const authIllustrationPanelSx = (theme: Theme) => ({
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  p: { xs: 4, sm: 6 },
  minHeight: { xs: 240, sm: "auto" },
  background: `linear-gradient(160deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 55%, #f2ede4 100%)`,
  position: "relative",
  overflow: "hidden",
});

export const authDecorCircleTopSx = {
  position: "absolute",
  width: 340,
  height: 340,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.18)",
  top: "-8%",
  left: "-6%",
};

export const authDecorCircleBottomSx = {
  position: "absolute",
  width: 200,
  height: 200,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.12)",
  bottom: "10%",
  right: "-4%",
};

export const authIllustrationWrapSx = {
  position: "relative",
  zIndex: 1,
};

export const authContentPanelSx = {
  flex: "0 0 auto",
  width: { xs: "100%", sm: 480 },
  maxWidth: 480,
  display: "flex",
  alignItems: { xs: "stretch", sm: "center" },
  justifyContent: "center",
  p: { xs: 3, sm: 5 },
  py: { xs: 4, sm: 5 },
};

export const authContentStackSx = {
  maxWidth: 480,
  width: "100%",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
};

export const authBrandTitleSx = {
  fontSize: { xs: 32, md: 38 },
  fontFamily: '"Instrument Serif", serif',
  color: "primary.main",
  letterSpacing: "-0.02em",
  lineHeight: 1.1,
};

export const authBrandSubtitleSx = {
  fontSize: 15,
  color: "text.secondary",
  fontWeight: 300,
};

export const authAlertSx = { borderRadius: "10px", fontSize: 14 };

export const authLinkRowSx = {
  textAlign: "center",
  fontSize: 14,
  color: "text.secondary",
};

export const authLinkSx = {
  color: "primary.main",
  fontWeight: 600,
  fontSize: 14,
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
};

export const authMutedCenterTextSx = {
  textAlign: "center",
  fontSize: 12,
  color: "text.secondary",
  opacity: 0.7,
};

export const authPrimaryButtonSx = { py: 1.5, fontSize: 15 };

export const getAuthSocialButtonSx = (theme: Theme) => ({
  py: 1.2,
  borderRadius: "12px",
  border: `1px solid ${theme.palette.divider}`,
  color: "text.primary",
  textTransform: "none",
  fontSize: 13,
  fontWeight: 500,
  "&.Mui-disabled": {
    color: "text.secondary",
    borderColor: "divider",
    opacity: 0.55,
  },
});

export const authDividerSx = {
  fontSize: 12,
  color: "text.secondary",
  "&::before, &::after": { borderColor: "divider" },
};
