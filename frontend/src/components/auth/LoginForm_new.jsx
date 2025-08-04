import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Google } from "@mui/icons-material";
import { loginUser } from "../../utils/auth";
import { loginWithGoogle } from "../../utils/oauth";
import { useApp } from "../../context/AppContext";
import { useRouter } from "next/router";

// Using your existing theme styling patterns
const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: theme.spacing(3),
}));

const LoginCard = styled(Box)(({ theme }) => ({
  background: "rgba(0, 0, 0, 0.8)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: "400px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "rgba(255, 255, 255, 0.3)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255, 255, 255, 0.5)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#667eea",
    },
    "& input": {
      color: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "rgba(255, 255, 255, 0.7)",
    "&.Mui-focused": {
      color: "#667eea",
    },
  },
  "& .MuiFormHelperText-root": {
    color: "#ff6b6b",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #667eea 30%, #764ba2 90%)",
  border: 0,
  borderRadius: "12px",
  boxShadow: "0 3px 5px 2px rgba(102, 126, 234, .3)",
  color: "white",
  height: 48,
  padding: "0 30px",
  marginTop: theme.spacing(2),
  "&:hover": {
    background: "linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)",
    boxShadow: "0 6px 10px 2px rgba(102, 126, 234, .3)",
  },
  "&:disabled": {
    background: "rgba(255, 255, 255, 0.3)",
    color: "rgba(255, 255, 255, 0.5)",
  },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "12px",
  color: "white",
  height: 48,
  marginBottom: theme.spacing(2),
  "&:hover": {
    background: "rgba(255, 255, 255, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
}));

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { actions } = useApp();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
    // Clear field-specific errors
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleLogin = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear any errors before starting OAuth
    setError("");
    setFieldErrors({});

    console.log("🔐 Starting Google OAuth from login...");
    loginWithGoogle("login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(formData.email, formData.password);

      if (result.success && result.user) {
        actions.setUserData(result.user);
        actions.setAuthenticated(true);
        actions.showNotification("Welcome back!", "success");

        // Redirect to homepage after successful login
        router.push("/");
      } else {
        setError(
          result.message || "Invalid email or password. Please try again."
        );
      }
    } catch (error) {
      setError("Unable to connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoginCard>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: "white",
              textAlign: "center",
              fontWeight: 700,
              marginBottom: 3,
            }}
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              marginBottom: 3,
            }}
          >
            Sign in to join your meetings
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                marginBottom: 2,
                backgroundColor: "rgba(211, 47, 47, 0.1)",
                color: "#ff6b6b",
                border: "1px solid rgba(211, 47, 47, 0.3)",
                "& .MuiAlert-icon": {
                  color: "#ff6b6b",
                },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Google OAuth Button - Outside of form */}
          <GoogleButton
            fullWidth
            startIcon={<Google />}
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            Continue with Google
          </GoogleButton>

          <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
            <Divider
              sx={{ flex: 1, borderColor: "rgba(255, 255, 255, 0.2)" }}
            />
            <Typography
              sx={{
                px: 2,
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "0.875rem",
              }}
            >
              or continue with email
            </Typography>
            <Divider
              sx={{ flex: 1, borderColor: "rgba(255, 255, 255, 0.2)" }}
            />
          </Box>

          {/* Email/Password Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              disabled={isLoading}
            />

            <StyledTextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              disabled={isLoading}
            />

            <StyledButton type="submit" fullWidth disabled={isLoading}>
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </StyledButton>
          </Box>

          <Box sx={{ textAlign: "center", marginTop: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Don't have an account?{" "}
              <Button
                onClick={() => router.push("/register")}
                sx={{
                  color: "#667eea",
                  textTransform: "none",
                  fontWeight: 600,
                  padding: 0,
                  minWidth: "auto",
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: "#5a67d8",
                  },
                }}
              >
                Sign up here
              </Button>
            </Typography>
          </Box>
        </LoginCard>
      </motion.div>
    </StyledContainer>
  );
};

export default LoginForm;
