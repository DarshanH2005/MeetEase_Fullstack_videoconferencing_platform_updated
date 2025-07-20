import React, { useState } from "react";
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
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { Google, GitHub, Apple } from "@mui/icons-material";
import BackgroundGradient from "../common/BackgroundGradient";
import EnhancedTextField from "../common/EnhancedTextField";
import EnhancedButton from "../common/EnhancedButton";
import { useApp } from "../../context/AppContext";

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
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

export default function LoginHero() {
  const { actions } = useApp();
  const { showNotification } = actions;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate success
      showNotification("Welcome back! Logging you in...", "success");

      // Here you would typically:
      // 1. Call your authentication API
      // 2. Store the user token
      // 3. Redirect to dashboard or previous page
    } catch (error) {
      showNotification("Invalid email or password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    showNotification(`${provider} login will be implemented soon`, "info");
  };

  return (
    <BackgroundGradient>
      <FormContainer>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            {/* Social Login Buttons */}
            <Stack spacing={2}>
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
            </Stack>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                or continue with email
              </Typography>
            </Divider>

            {/* Email Field */}
            <EnhancedTextField
              fullWidth
              label="Email"
              type="email"
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

            {/* Password Field */}
            <EnhancedTextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
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

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: "right" }}>
              <Link
                href="#"
                variant="body2"
                color="primary"
                sx={{
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot your password?
              </Link>
            </Box>

            {/* Submit Button */}
            <EnhancedButton
              type="submit"
              fullWidth
              size="large"
              loading={loading}
              disabled={loading}
            >
              Sign In
            </EnhancedButton>
          </Stack>
        </Box>

        {/* Sign Up Link */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              color="primary"
              sx={{
                textDecoration: "none",
                fontWeight: 500,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </FormContainer>
    </BackgroundGradient>
  );
}
