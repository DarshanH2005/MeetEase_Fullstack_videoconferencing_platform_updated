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
  styled,
  Divider,
} from "@mui/material";
import { Google } from "@mui/icons-material";
import { registerUser } from "../../utils/auth";
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

const SignupCard = styled(Box)(({ theme }) => ({
  background: "rgba(0, 0, 0, 0.8)",
  backdropFilter: "blur(20px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
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

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { actions } = useApp();
  const router = useRouter();
  // Track the notification id for the persistent toast
  const [wakeupToastId, setWakeupToastId] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
    // Clear field-specific error
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    }

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!formData.email.includes("@")) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the errors below");
      return;
    }

    setIsLoading(true);
    setError("");

    // Show persistent 'server is waking up' toast
    const toastId = actions.showNotification(
      "Server is waking up... This may take a few seconds.",
      "info",
      { persistent: true }
    );
    setWakeupToastId(toastId);

    try {
      const result = await registerUser(
        formData.name,
        formData.username,
        formData.email,
        formData.password
      );

      // Remove the persistent toast
      actions.removeNotification(toastId);
      setWakeupToastId(null);

      if (result.success && result.user) {
        // Update app context
        actions.setUserData(result.user);
        actions.setAuthenticated(true);
        actions.showNotification(
          `Welcome to MeetEase, ${result.user.name}!`,
          "success"
        );

        // Always redirect to homepage after successful registration
        router.push("/");
      } else {
        setError(result.message || "Registration failed. Please try again.");
        actions.showNotification(
          result.message || "Registration failed. Please try again.",
          "error"
        );
      }
    } catch (error) {
      actions.removeNotification(toastId);
      setWakeupToastId(null);
      setError("Unable to connect to server. Please try again later.");
      actions.showNotification(
        "Unable to connect to server. Please try again later.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Clear any existing errors
    setError("");
    setFieldErrors({});

    console.log("🔐 Starting Google OAuth from signup...");
    loginWithGoogle("register");
  };

  return (
    <StyledContainer maxWidth={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SignupCard>
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
            Create Account
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              marginBottom: 3,
            }}
          >
            Join MeetEase to start hosting meetings
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

          <form onSubmit={handleSubmit}>
            <StyledTextField
              fullWidth
              label="Full Name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
              sx={{
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  backgroundColor: "transparent",
                },
              }}
            />

            <StyledTextField
              fullWidth
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
              sx={{
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  backgroundColor: "transparent",
                },
              }}
            />

            <StyledTextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              sx={{
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  backgroundColor: "transparent",
                },
              }}
            />

            <StyledTextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              sx={{
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  backgroundColor: "transparent",
                },
              }}
            />

            <StyledTextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              sx={{
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  backgroundColor: "transparent",
                },
              }}
            />

            <StyledButton type="submit" fullWidth disabled={isLoading}>
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Create Account"
              )}
            </StyledButton>
          </form>

          <Divider
            sx={{
              my: 3,
              "&:before, &:after": { borderColor: "rgba(255, 255, 255, 0.3)" },
            }}
          >
            <Typography sx={{ color: "rgba(255, 255, 255, 0.5)", px: 2 }}>
              or
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            sx={{
              borderColor: "rgba(255, 255, 255, 0.3)",
              color: "white",
              height: 48,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                borderColor: "rgba(255, 255, 255, 0.5)",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
              "&:disabled": {
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: "rgba(255, 255, 255, 0.3)",
              },
            }}
            startIcon={<Google />}
          >
            Continue with Google
          </Button>

          <Box sx={{ textAlign: "center", marginTop: 3 }}>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
            >
              Already have an account?{" "}
              <Button
                onClick={() => router.push("/auth/login")}
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
                Sign in here
              </Button>
            </Typography>
          </Box>
        </SignupCard>
      </motion.div>
    </StyledContainer>
  );
};

export default SignupForm;
