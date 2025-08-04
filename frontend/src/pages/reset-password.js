import React, { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Email } from "@mui/icons-material";
import { useApp } from "../context/AppContext";

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  padding: theme.spacing(3),
}));

const ResetCard = styled(Paper)(({ theme }) => ({
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

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const router = useRouter();
  const { actions } = useApp();

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call for password reset
      // In a real app, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage("If an account with that email exists, we've sent you a password reset link.");
      actions.showNotification("Password reset email sent!", "success");
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (error) {
      setError("Something went wrong. Please try again later.");
      actions.showNotification("Failed to send reset email", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError("");
    }
    if (error) {
      setError("");
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - MeetEase</title>
        <meta name="description" content="Reset your MeetEase account password" />
      </Head>
      
      <StyledContainer maxWidth={false}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResetCard>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Email sx={{ fontSize: 48, color: "#667eea", mb: 2 }} />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  marginBottom: 1,
                }}
              >
                Reset Password
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                Enter your email to receive a password reset link
              </Typography>
            </Box>

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

            {message && (
              <Alert
                severity="success"
                sx={{
                  marginBottom: 2,
                  backgroundColor: "rgba(76, 175, 80, 0.1)",
                  color: "#4caf50",
                  border: "1px solid rgba(76, 175, 80, 0.3)",
                  "& .MuiAlert-icon": {
                    color: "#4caf50",
                  },
                }}
              >
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <StyledTextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                disabled={isLoading || !!message}
                autoComplete="email"
                autoFocus
              />

              <StyledButton
                type="submit"
                fullWidth
                disabled={isLoading || !!message}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Send Reset Link"
                )}
              </StyledButton>
            </Box>

            <Box sx={{ textAlign: "center", marginTop: 3 }}>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Remember your password?{" "}
                <Button
                  onClick={() => router.push("/login")}
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
                  Back to Sign In
                </Button>
              </Typography>
            </Box>
          </ResetCard>
        </motion.div>
      </StyledContainer>
    </>
  );
}
