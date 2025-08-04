import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import EnhancedTextField from "../components/common/EnhancedTextField";
import EnhancedButton from "../components/common/EnhancedButton";
import { Box, Typography, Stack, Paper } from "@mui/material";

export default function ProfilePage() {
  const { state, actions } = useApp();
  const { user } = state;
  const { showNotification, setUserData } = actions;
  const [formData, setFormData] = useState({
    name: user?.name || "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
      // TODO: Replace with real API call
      setTimeout(() => {
        setUserData({ ...user, name: formData.name });
        showNotification("Profile updated!", "success");
        setLoading(false);
      }, 1000);
    } catch (err) {
      showNotification("Failed to update profile", "error");
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Paper sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" mb={2}>
          Edit Profile
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <EnhancedTextField
              label="Email"
              value={user?.email || ""}
              disabled
              fullWidth
            />
            <EnhancedTextField
              label="Name"
              value={formData.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
            />
            <EnhancedTextField
              label="New Password"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
            />
            <EnhancedTextField
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              fullWidth
            />
            <EnhancedButton type="submit" loading={loading} fullWidth>
              Save Changes
            </EnhancedButton>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
