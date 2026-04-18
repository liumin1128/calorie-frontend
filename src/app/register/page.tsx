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
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import {
  authAlertSx,
  authInputSx,
  authLinkRowSx,
  authLinkSx,
  authPrimaryButtonSx,
} from "@/components/auth/authStyles";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }
    if (password !== confirmPwd) {
      setError("两次密码不一致");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, nickname || undefined);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout subtitle="创建账户，开始健康之旅">
      {error && (
        <Alert severity="error" sx={authAlertSx}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <Stack spacing={3}>
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
              label="昵称（可选）"
              fullWidth
              variant="standard"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
              helperText="至少6位"
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

            <TextField
              label="确认密码"
              type={showPwd ? "text" : "password"}
              fullWidth
              required
              variant="standard"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
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
            {loading ? "注册中..." : "创建账户"}
          </Button>
        </Stack>
      </Box>

      <Typography sx={authLinkRowSx}>
        已有账户？{" "}
        <Typography component="a" href="/login" sx={authLinkSx}>
          去登录
        </Typography>
      </Typography>
    </AuthLayout>
  );
}
