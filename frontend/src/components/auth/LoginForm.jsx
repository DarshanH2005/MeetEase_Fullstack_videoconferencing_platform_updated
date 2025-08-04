import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import { loginUser } from "../../utils/auth";
import { loginWithGoogle } from "../../utils/oauth";
import { useApp } from "../../context/AppContext";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const { actions } = useApp();
  const { setUserData, setAuthenticated, showNotification } = actions;

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(email, password);

      if (result.success) {
        setUserData(result.user);
        setAuthenticated(true);
        showNotification(`Welcome back, ${result.user.name}!`, "success");

        // Clear form
        setEmail("");
        setPassword("");
        setErrors({});

        // Redirect to homepage
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
      } else {
        setLoginError(result.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear any form errors before starting OAuth
    setErrors({});
    setLoginError("");

    console.log("🚀 Starting Google OAuth from login form");
    loginWithGoogle("login");
  };

  return (
    <Box component="div" sx={{ width: "100%", maxWidth: 400 }}>
      {/* Regular Login Form */}
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Welcome Back
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          align="center"
          sx={{ mb: 3 }}
        >
          Sign in to your account
        </Typography>

        {loginError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginError}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) {
              setErrors({ ...errors, email: "" });
            }
          }}
          error={!!errors.email}
          helperText={errors.email}
          margin="normal"
          autoComplete="email"
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) {
              setErrors({ ...errors, password: "" });
            }
          }}
          error={!!errors.password}
          helperText={errors.password}
          margin="normal"
          autoComplete="current-password"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2, py: 1.5 }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : "Sign In"}
        </Button>

        <Box textAlign="center" sx={{ mb: 2 }}>
          <Link href="/reset-password" underline="hover">
            Forgot your password?
          </Link>
        </Box>
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3 }}>or</Divider>

      {/* Google OAuth Button - Outside the form */}
      <Box component="div">
        <Button
          fullWidth
          variant="outlined"
          startIcon={<Google />}
          onClick={handleGoogleLogin}
          sx={{
            py: 1.5,
            borderColor: "#dadce0",
            color: "#3c4043",
            "&:hover": {
              backgroundColor: "#f8f9fa",
              borderColor: "#dadce0",
            },
          }}
        >
          Continue with Google
        </Button>
      </Box>

      <Box textAlign="center" sx={{ mt: 3 }}>
        <Typography variant="body2">
          Don't have an account?{" "}
          <Link href="/register" underline="hover">
            Sign up
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
