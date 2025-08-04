import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Drawer,
  Avatar,
  Divider,
  Chip,
  Paper,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import EnhancedTextField from "../common/EnhancedTextField";
import EnhancedButton from "../common/EnhancedButton";
import { useApp } from "../../context/AppContext";
import { updateUserProfile } from "../../utils/auth";

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.1
  )}, ${alpha(theme.palette.primary.dark, 0.05)})`,
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  marginBottom: theme.spacing(3),
  textAlign: "center",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export default function ProfileOverlay({ open, onClose }) {
  const { state, actions } = useApp();
  const { user } = state;
  const { showNotification, setUserData } = actions;
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync form data with user data when modal opens
  useEffect(() => {
    if (open && user) {
      setFormData({
        name: user.name || "",
        password: "",
        confirmPassword: "",
      });
      setErrors({}); // Clear any previous errors
    }
  }, [open, user]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (formData.password && formData.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate())
      return showNotification("Please fix the errors above", "error");

    setLoading(true);
    try {
      console.log("🔄 Updating profile...");

      // Prepare update data - only include changed fields
      const updateData = {};

      // Always include name if it's different from current user name
      if (formData.name.trim() !== (user?.name || "")) {
        updateData.name = formData.name.trim();
      }

      // Include password only if it's provided
      if (formData.password && formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      console.log("📤 Update data:", updateData);

      // Call the real API
      const result = await updateUserProfile(updateData);

      if (result.success && result.user) {
        // Update the context with the new user data
        setUserData(result.user);
        showNotification("Profile updated successfully!", "success");

        // Clear password fields after successful update
        setFormData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));

        // Close the modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        // Handle API error
        const errorMessage = result.message || "Failed to update profile";
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      showNotification("Network error. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 420,
          borderRadius: "20px 0 0 20px",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? alpha(theme.palette.background.paper, 0.95)
              : alpha(theme.palette.background.paper, 0.98),
          backdropFilter: "blur(20px)",
          border: "1px solid",
          borderColor: "divider",
          borderRight: "none",
        },
      }}
    >
      <Box sx={{ p: 3, height: "100%" }}>
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: "text.primary" }}
          >
            Profile Settings
          </Typography>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                background: (theme) => alpha(theme.palette.error.main, 0.1),
                color: "error.main",
                borderRadius: "8px",
                "&:hover": {
                  background: (theme) => alpha(theme.palette.error.main, 0.2),
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </motion.div>
        </Box>

        {/* Profile Info Header */}
        <ProfileHeader elevation={0}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                fontSize: "2rem",
                fontWeight: 700,
                margin: "0 auto 16px",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: "white",
                boxShadow: (theme) =>
                  `0px 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              {(user?.name || user?.username)?.charAt(0).toUpperCase()}
            </Avatar>
          </motion.div>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ color: "text.primary", mb: 1 }}
          >
            {user?.name || user?.username}
          </Typography>
          <Chip
            label={user?.email}
            variant="outlined"
            size="small"
            icon={<EmailIcon />}
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              "& .MuiChip-icon": { color: "primary.main" },
            }}
          />
        </ProfileHeader>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Personal Information Section */}
            <Box>
              <SectionTitle>
                <PersonIcon fontSize="small" />
                Personal Information
              </SectionTitle>
              <Stack spacing={2}>
                <EnhancedTextField
                  label="Email Address"
                  value={user?.email || ""}
                  disabled
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
                <EnhancedTextField
                  label="Full Name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  error={!!errors.name}
                  helperText={errors.name}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Security Section */}
            <Box>
              <SectionTitle>
                <LockIcon fontSize="small" />
                Security & Password
              </SectionTitle>
              <Stack spacing={2}>
                <EnhancedTextField
                  label="New Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  error={!!errors.password}
                  helperText={
                    errors.password || "Leave blank to keep current password"
                  }
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
                <EnhancedTextField
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <LockIcon sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Stack>
            </Box>

            {/* Action Button */}
            <Box sx={{ pt: 2 }}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <EnhancedButton
                  type="submit"
                  loading={loading}
                  fullWidth
                  variant="primary"
                  sx={{
                    height: "48px",
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  Save Changes
                </EnhancedButton>
              </motion.div>
            </Box>
          </Stack>
        </form>
      </Box>
    </Drawer>
  );
}
