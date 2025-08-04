import { useState, useEffect } from "react";
import { Box, Typography, Button, Alert, Paper } from "@mui/material";
import { useApp } from "../context/AppContext";
import { isAuthenticated, logoutUser } from "../utils/auth";

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const { state, actions } = useApp();

  const addLog = (message) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthStatus(isAuth);
      addLog(
        `Authentication check: ${
          isAuth ? "Authenticated" : "Not authenticated"
        }`
      );
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    addLog("Logout button clicked");
    logoutUser();
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Authentication Test Page
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Status
        </Typography>

        <Alert severity={authStatus ? "success" : "info"} sx={{ mb: 2 }}>
          {authStatus ? "User is authenticated" : "User is not authenticated"}
        </Alert>

        {state.user && (
          <Box sx={{ mb: 2 }}>
            <Typography>
              <strong>User:</strong> {state.user.name}
            </Typography>
            <Typography>
              <strong>Email:</strong> {state.user.email}
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button variant="contained" href="/login">
            Go to Login
          </Button>

          <Button variant="contained" href="/register">
            Go to Register
          </Button>

          {authStatus && (
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Test Logout
            </Button>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Debug Logs</Typography>
          <Button size="small" onClick={clearLogs}>
            Clear Logs
          </Button>
        </Box>

        <Box
          sx={{
            maxHeight: 300,
            overflow: "auto",
            bgcolor: "#f5f5f5",
            p: 1,
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.875rem",
          }}
        >
          {logs.length === 0 ? (
            <Typography color="text.secondary">No logs yet...</Typography>
          ) : (
            logs.map((log, index) => (
              <Typography key={index} component="div">
                {log}
              </Typography>
            ))
          )}
        </Box>
      </Paper>
    </Box>
  );
}
