"use client";

import { usePathname } from "next/navigation";
import NextLink from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "健康建议", href: "/health-advice" },
];

const NO_NAV_PATHS = ["/login", "/register"];

export default function TopNavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (NO_NAV_PATHS.includes(pathname)) return null;

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ gap: 2 }}>
        {/* Brand */}
        <Typography
          component={NextLink}
          href="/"
          sx={{
            fontSize: 24,
            fontFamily: '"Instrument Serif", serif',
            color: "primary.main",
            textDecoration: "none",
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          CaloTrack
        </Typography>

        {/* Nav pills */}
        <Box
          component="nav"
          sx={{ display: "flex", gap: 0.5, flexGrow: 1, ml: 2 }}
          aria-label="主导航"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === pathname;
            return (
              <Box
                key={item.href}
                component={NextLink}
                href={item.href}
                sx={{
                  px: 2,
                  py: 0.75,
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "primary.main" : "text.secondary",
                  bgcolor: isActive ? "rgba(61,107,79,0.08)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: isActive
                      ? "rgba(61,107,79,0.12)"
                      : "rgba(0,0,0,0.04)",
                  },
                }}
              >
                {item.label}
              </Box>
            );
          })}
        </Box>

        {/* User area */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={user?.nickname || "用户"}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "primary.light",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {user?.nickname?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </Tooltip>
          <Tooltip title="退出登录">
            <IconButton
              size="small"
              onClick={logout}
              sx={{ color: "text.secondary" }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
