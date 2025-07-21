import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Link,
  Stack,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from "@mui/icons-material";
import { Google, GitHub, Apple } from "@mui/icons-material";
import BackgroundGradient from "../common/BackgroundGradient";
import EnhancedTextField from "../common/EnhancedTextField";
import EnhancedButton from "../common/EnhancedButton";
import { useApp } from "../../context/AppContext";
import { registerUser } from "../../utils/auth";
import server from "../../utils/environment";
// Backend wakeup notification logic
useEffect(() => {
  let didRespond = false;
  let notifyTimeout = setTimeout(() => {
    if (!didRespond)
      showNotification("Waking up server, please wait...", "info");
  }, 500);

  fetch(server + "/api/v1/ping", { method: "GET" })
    .then(async (res) => {
      didRespond = true;
      clearTimeout(notifyTimeout);
      if (res.ok) {
        showNotification("Server connected!", "success");
      } else {
        showNotification("Server responded with error.", "warning");
      }
    })
    .catch(() => {
      didRespond = true;
      clearTimeout(notifyTimeout);
      showNotification(
        "Server failed to respond. Please try again later.",
        "error"
      );
    });
  // eslint-disable-next-line
}, []);

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(5),
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
  },
}));

const SocialButton = styled(motion.button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: theme.spacing(1.5),
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(0, 0, 0, 0.1)",
  borderRadius: theme.shape.borderRadius,
  background: "transparent",
  color: theme.palette.text.primary,
  cursor: "pointer",
  transition: "all 0.2s ease",
  fontFamily: theme.typography.fontFamily,
  fontSize: "0.875rem",
  fontWeight: 500,
  gap: theme.spacing(1),
  "&:hover": {
    background:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(0, 0, 0, 0.05)",
    borderColor:
      theme.palette.mode === "dark"
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(0, 0, 0, 0.2)",
  },
}));

export default function RegisterHeroNew() {
  const router = useRouter();
  const { actions } = useApp();
  const { showNotification, setUserData, setAuthenticated } = actions;
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showNotification("Please fix the errors above", "error");
      return;
    }

    setLoading(true);

    try {
      // Call the real registration API
      const result = await registerUser(
        formData.fullName,
        formData.fullName.toLowerCase().replace(/\s+/g, ""), // Generate username from name
        formData.email.toLowerCase(),
        formData.password
      );

      // Check if registration was successful
      if (result.success && result.user) {
        // Update app context with user data
        setUserData(result.user);
        setAuthenticated(true);

        showNotification(
          "Account created successfully! Welcome to MeetEase.",
          "success"
        );

        // Check for redirect URL (for meeting room access)
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect") || "/";

        // Redirect after successful registration
        setTimeout(() => {
          router.push(redirectUrl);
        }, 1000);
      } else {
        // Handle registration failure - show user-friendly message
        const errorMessage =
          result.message || "Registration failed. Please try again.";
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      // Handle unexpected errors (network issues, etc.)
      showNotification(
        "Unable to connect to server. Please try again later.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    showNotification(
      `${provider} registration will be implemented soon`,
      "info"
    );
  };

  return (
    <BackgroundGradient>
      <FormContainer>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            <SocialButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSocialLogin("Google")}
            >
              <Google sx={{ fontSize: 18 }} />
              Continue with Google
            </SocialButton>

            <Stack direction="row" spacing={2}>
              <SocialButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin("GitHub")}
                style={{ flex: 1 }}
              >
                <GitHub sx={{ fontSize: 18 }} />
                GitHub
              </SocialButton>
              <SocialButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSocialLogin("Apple")}
                style={{ flex: 1 }}
              >
                <Apple sx={{ fontSize: 18 }} />
                Apple
              </SocialButton>
            </Stack>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or create account with email
              </Typography>
            </Divider>

            <EnhancedTextField
              fullWidth
              label="Full Name"
              name="fullName"
              type="text"
              autoComplete="name"
              value={formData.fullName}
              onChange={handleInputChange("fullName")}
              error={!!errors.fullName}
              helperText={errors.fullName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <EnhancedTextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              error={!!errors.email}
              helperText={errors.email}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <EnhancedTextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange("password")}
              error={!!errors.password}
              helperText={errors.password}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <EnhancedTextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "text.secondary", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              By creating an account, you agree to our{" "}
              <Link
                href="#"
                color="primary"
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                color="primary"
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Privacy Policy
              </Link>
            </Typography>

            <EnhancedButton
              type="submit"
              fullWidth
              size="large"
              loading={loading}
              disabled={loading}
            >
              Create Account
            </EnhancedButton>
          </Stack>
        </Box>

        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              color="primary"
              sx={{
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </FormContainer>
    </BackgroundGradient>
  );
}
