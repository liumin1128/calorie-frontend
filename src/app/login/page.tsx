"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AppleIcon from "@mui/icons-material/Apple";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  authAlertSx,
  authDividerSx,
  authInputSx,
  authLinkRowSx,
  authLinkSx,
  authMutedCenterTextSx,
  authPrimaryButtonSx,
  getAuthSocialButtonSx,
} from "@/components/auth/authStyles";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="记录每一口，掌控每一天">
      {error && (
        <Alert severity="error" sx={authAlertSx}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={4.5}>
          <Stack spacing={3.5}>
            <TextField
              label="邮箱"
              type="email"
              fullWidth
              required
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={authInputSx}
            />

            <TextField
              label="密码"
              type={showPwd ? "text" : "password"}
              fullWidth
              required
              variant="standard"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPwd((v) => !v)}
                        edge="end"
                        aria-label={showPwd ? "隐藏密码" : "显示密码"}
                        sx={{ color: "text.secondary" }}
                      >
                        {showPwd ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={authInputSx}
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={authPrimaryButtonSx}
          >
            {loading ? "登录中..." : "登录"}
          </Button>
        </Stack>
      </Box>

      <Divider sx={authDividerSx}>或</Divider>

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          fullWidth
          disabled
          startIcon={<GoogleIcon />}
          sx={getAuthSocialButtonSx}
        >
          Google
        </Button>
        <Button
          fullWidth
          disabled
          startIcon={<AppleIcon sx={{ fontSize: 20 }} />}
          sx={getAuthSocialButtonSx}
        >
          Apple
        </Button>
      </Box>

      <Typography sx={authMutedCenterTextSx}>即将支持第三方登录</Typography>

      <Typography sx={authLinkRowSx}>
        没有账户？{" "}
        <Typography component="a" href="/register" sx={authLinkSx}>
          立即注册
        </Typography>
      </Typography>
    </AuthLayout>
  );
}

/** Inline Google "G" logo */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
