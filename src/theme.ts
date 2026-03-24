"use client";

import { createTheme, type Shadows } from "@mui/material/styles";

/* ── 弱阴影：仅保留 1-3 级微弱投影，其余全部去掉 ── */
const softShadows = Array.from({ length: 25 }, () => "none") as Shadows;
softShadows[1] = "0 2px 6px rgba(23,37,84,0.06)";
softShadows[2] = "0 6px 14px rgba(23,37,84,0.08)";
softShadows[3] = "0 10px 22px rgba(23,37,84,0.10)";

const theme = createTheme({
  shadows: softShadows,
  shape: { borderRadius: 16 },
  palette: {
    mode: "light",
    primary: { main: "#ff7a59", light: "#ffa489", dark: "#e35f3f" },
    secondary: { main: "#2bb9b1", light: "#82ddd8", dark: "#10928c" },
    background: { default: "#fff8f3", paper: "#ffffff" },
    text: { primary: "#3a2a2a", secondary: "#786a6a" },
    warning: { main: "#ff9f43" },
    success: { main: "#3abf7a" },
  },
  typography: {
    fontFamily:
      '"Avenir Next","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 800 },
  },
  components: {
    /* 全局背景：浅色暖调渐变 */
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(1200px 800px at 10% -10%,#ffe8dc 0%,transparent 55%)," +
            "radial-gradient(900px 700px at 90% 0%,#dff7f5 0%,transparent 50%)," +
            "#fff8f3",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        },
      },
    },
    /* 顶栏：半透明磨砂 + 细边线，去掉默认阴影 */
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255,255,255,0.85)",
          color: "#4a3a3a",
          backdropFilter: "blur(8px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,122,89,0.18)",
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
        root: { border: "1px solid rgba(255,122,89,0.16)" },
      },
    },
    /* 按钮：胶囊圆角 + 暖色渐变，去掉 contained 默认阴影 */
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 14 },
        contained: { boxShadow: "none" },
        containedPrimary: {
          background: "linear-gradient(135deg,#ff8f6e 0%,#ff6d4d 100%)",
        },
      },
    },
    /* 浮动按钮：轻柔橙色光晕 */
    MuiFab: {
      styleOverrides: {
        root: { boxShadow: "0 8px 20px rgba(255,122,89,0.25)" },
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
          borderRadius: 20,
          boxShadow: "0 12px 26px rgba(58,42,42,0.12)",
          border: "1px solid rgba(255,122,89,0.18)",
        },
      },
    },
  },
});

export default theme;
