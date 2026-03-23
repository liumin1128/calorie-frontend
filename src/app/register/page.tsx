"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card elevation={3} sx={{ maxWidth: 420, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <LocalFireDepartmentIcon
              sx={{ fontSize: 48, color: "primary.main" }}
            />
            <Typography variant="h5" fontWeight="bold" mt={1}>
              Calorie Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              创建新账户
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="邮箱"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="昵称（可选）"
              fullWidth
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="密码"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="至少6位"
              sx={{ mb: 2 }}
            />
            <TextField
              label="确认密码"
              type="password"
              fullWidth
              required
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? "注册中..." : "注册"}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" mt={2}>
            已有账户？{" "}
            <Link
              href="/login"
              underline="hover"
              sx={{ cursor: "pointer", fontWeight: "bold" }}
            >
              去登录
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
