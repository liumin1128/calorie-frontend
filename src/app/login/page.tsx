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
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import AppleIcon from "@mui/icons-material/Apple";
import { keyframes } from "@emotion/react";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const gentleFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
`;

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

  /* shared input sx */
  const inputSx = {
    mb: 3.5,
    "& .MuiInput-underline:before": { borderBottomColor: "divider" },
    "& .MuiInput-underline:after": { borderBottomColor: "primary.main" },
    "& .MuiInputLabel-root": { color: "text.secondary", fontSize: 14 },
    "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
    /* 覆盖浏览器 autofill 蓝色背景 */
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
      {/* ——— Left: illustration panel ——— */}
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
        {/* decorative circles */}
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

      {/* ——— Right: form panel ——— */}
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
              mb: 5,
              fontWeight: 300,
            }}
          >
            记录每一口，掌控每一天
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
              sx={{ ...inputSx, mb: 4.5 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5, fontSize: 15 }}
            >
              {loading ? "登录中..." : "登录"}
            </Button>
          </Box>

          {/* Divider */}
          <Divider
            sx={{
              my: 3.5,
              fontSize: 12,
              color: "text.secondary",
              "&::before, &::after": { borderColor: "divider" },
            }}
          >
            或
          </Divider>

          {/* Social login */}
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              fullWidth
              disabled
              startIcon={<GoogleIcon />}
              sx={(theme) => ({
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
              })}
            >
              Google
            </Button>
            <Button
              fullWidth
              disabled
              startIcon={<AppleIcon sx={{ fontSize: 20 }} />}
              sx={(theme) => ({
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
              })}
            >
              Apple
            </Button>
          </Box>

          <Typography
            sx={{
              textAlign: "center",
              mt: 2.5,
              fontSize: 12,
              color: "text.secondary",
              opacity: 0.7,
            }}
          >
            即将支持第三方登录
          </Typography>

          {/* Register link */}
          <Typography
            sx={{
              textAlign: "center",
              mt: 3.5,
              fontSize: 14,
              color: "text.secondary",
            }}
          >
            没有账户？{" "}
            <Typography
              component="a"
              href="/register"
              sx={{
                color: "primary.main",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              立即注册
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
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
