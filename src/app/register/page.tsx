"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAuth } from "@/contexts/AuthContext";
import { fadeUp, fadeIn, gentleFloat } from "@/lib/animations";

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

  const inputSx = {
    mb: 3,
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        bgcolor: "background.default",
      }}
    >
      {/* Left: illustration panel */}
      <Box
        sx={(theme) => ({
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, sm: 6 },
          minHeight: { xs: 240, sm: "auto" },
          background: `linear-gradient(160deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 55%, #f2ede4 100%)`,
          position: "relative",
          overflow: "hidden",
          animation: `${fadeIn} 0.8s ease-out`,
        })}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            top: "-8%",
            left: "-6%",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            bottom: "10%",
            right: "-4%",
          }}
        />

        <Box
          sx={{
            animation: `${gentleFloat} 6s ease-in-out infinite`,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Image
            src="/illustrations/login-hero.svg"
            alt="健康饮食插画"
            width={420}
            height={380}
            priority
            style={{
              maxWidth: "100%",
              height: "auto",
              filter: "drop-shadow(0 8px 24px rgba(61,107,79,0.08))",
            }}
          />
        </Box>
      </Box>

      {/* Right: form panel */}
      <Box
        sx={{
          flex: "0 0 auto",
          width: { xs: "100%", sm: 480 },
          maxWidth: 480,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 5 },
        }}
      >
        <Box
          sx={{
            maxWidth: 480,
            width: "100%",
            animation: `${fadeUp} 0.7s ease-out`,
          }}
        >
          {/* Brand */}
          <Typography
            sx={{
              fontSize: { xs: 32, md: 38 },
              fontFamily: '"Instrument Serif", serif',
              color: "primary.main",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              mb: 0.5,
            }}
          >
            CaloTrack
          </Typography>
          <Typography
            sx={{
              fontSize: 15,
              color: "text.secondary",
              mb: 4,
              fontWeight: 300,
            }}
          >
            创建账户，开始健康之旅
          </Typography>

          {/* Error */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: "10px", fontSize: 14 }}
            >
              {error}
            </Alert>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              label="邮箱"
              type="email"
              fullWidth
              required
              variant="standard"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={inputSx}
            />

            <TextField
              label="昵称（可选）"
              fullWidth
              variant="standard"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              sx={inputSx}
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
              sx={inputSx}
            />

            <TextField
              label="确认密码"
              type={showPwd ? "text" : "password"}
              fullWidth
              required
              variant="standard"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              sx={{ ...inputSx, mb: 4 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5, fontSize: 15 }}
            >
              {loading ? "注册中..." : "创建账户"}
            </Button>
          </Box>

          {/* Login link */}
          <Typography
            sx={{
              textAlign: "center",
              mt: 3.5,
              fontSize: 14,
              color: "text.secondary",
            }}
          >
            已有账户？{" "}
            <Typography
              component="a"
              href="/login"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              去登录
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
