"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  shape: { borderRadius: 12 },
  palette: {
    mode: "light",
    primary: { main: "#3d6b4f", light: "#6b9b7a", dark: "#2d5a3f" },
    secondary: { main: "#a5d6a7", light: "#d0e8d0", dark: "#6b9b5e" },
    background: { default: "#fafaf5", paper: "#ffffff" },
    text: { primary: "#2a2a2a", secondary: "#8a8a82" },
    warning: { main: "#f49420" },
    success: { main: "#4a7a40" },
    divider: "#d8d8d0",
  },
  typography: {
    fontFamily:
      '"Avenir Next","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
  },
  components: {
    /* 全局背景：鼠尾草绿浅调渐变 */
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(1200px 800px at 10% -10%,#e8f3e8 0%,transparent 55%)," +
            "radial-gradient(900px 700px at 90% 0%,#d0e4d0 0%,transparent 50%)," +
            "#fafaf5",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        },
      },
    },
    /* 顶栏：半透明磨砂 + 细边线 */
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(250,250,245,0.85)",
          color: "#2a2a2a",
          backdropFilter: "blur(8px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(61,107,79,0.12)",
        },
      },
    },
    /* Paper 去掉默认 backgroundImage */
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    /* 卡片：细边框代替重阴影 */
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: { border: "1px solid rgba(61,107,79,0.10)" },
      },
    },
    /* 按钮：圆角12px，去掉 contained 默认阴影 */
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 14 },
        contained: { boxShadow: "none" },
        containedPrimary: {
          background: "#3d6b4f",
          "&:hover": {
            background: "#2d5a3f",
            boxShadow: "0 4px 14px rgba(61,107,79,0.22)",
          },
        },
      },
    },
    /* 浮动按钮：柔和绿色光晕 */
    MuiFab: {
      styleOverrides: {
        root: { boxShadow: "0 8px 20px rgba(61,107,79,0.18)" },
      },
    },
    /* Chip：胶囊形 */
    MuiChip: {
      styleOverrides: { root: { borderRadius: 999 } },
    },
    /* 弹窗：更大圆角 + 细边框 */
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 12px 26px rgba(42,42,42,0.10)",
          border: "1px solid rgba(61,107,79,0.12)",
        },
      },
    },
    MuiStack: {
      defaultProps: {
        useFlexGap: true,
      },
    },
  },
});

export default theme;
