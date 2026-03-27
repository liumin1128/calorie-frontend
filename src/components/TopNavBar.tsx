"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/contexts/AuthContext";
import ProfileDialog from "@/components/ProfileDialog";

const NAV_ITEMS = [
  { label: "首页", href: "/" },
  { label: "健康建议", href: "/health-advice" },
];

const NO_NAV_PATHS = ["/login", "/register"];

export default function TopNavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  if (NO_NAV_PATHS.includes(pathname)) return null;

  const currentTab =
    NAV_ITEMS.find((item) => item.href === pathname)?.href ?? false;

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <LocalFireDepartmentIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{ mr: 2, flexShrink: 0 }}
          >
            Calorie Tracker
          </Typography>
          <Tabs
            value={currentTab}
            textColor="inherit"
            sx={{
              flexGrow: 1,
              "& .MuiTabs-indicator": { backgroundColor: "white" },
            }}
            aria-label="主导航"
          >
            {NAV_ITEMS.map((item) => (
              <Tab
                key={item.href}
                label={item.label}
                value={item.href}
                href={item.href}
                component={NextLink}
              />
            ))}
          </Tabs>
          <Tooltip title={user?.nickname || "个人信息"}>
            <IconButton color="inherit" onClick={() => setProfileOpen(true)}>
              <PersonIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="退出登录">
            <IconButton color="inherit" onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <ProfileDialog open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
