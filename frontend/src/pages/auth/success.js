import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useApp } from "../../context/AppContext";
import { handleOAuthCallback, checkOAuthParams } from "../../utils/oauth";

export default function AuthSuccess() {
  const router = useRouter();
  const { actions } = useApp();
  const { setUserData, setAuthenticated, showNotification } = actions;

  useEffect(() => {
    const processOAuth = async () => {
      try {
        // Check for OAuth parameters with state validation
        const oauthData = checkOAuthParams();

        if (oauthData?.error) {
          let errorMessage = "Authentication failed. Please try again.";

          // Handle specific OAuth errors
          switch (oauthData.error) {
            case "invalid_state":
              errorMessage = "Security validation failed. Please try again.";
              break;
            case "state_expired":
              errorMessage =
                "Authentication session expired. Please try again.";
              break;
            case "invalid_data":
              errorMessage = "Invalid authentication data. Please try again.";
              break;
            default:
              errorMessage = `Authentication error: ${oauthData.error}`;
          }

          showNotification(errorMessage, "error");
          console.log("🔄 OAuth error, redirecting to login...");
          router.push("/login");
          return;
        }

        if (oauthData?.token && oauthData?.userData) {
          console.log("🔄 Processing OAuth callback...");

          // Handle successful OAuth with state verification
          const result = await handleOAuthCallback(
            oauthData.token,
            oauthData.userData,
            oauthData.state
          );

          console.log("📋 OAuth callback result:", result);

          if (result.success) {
            // Update app context
            setUserData(result.user);
            setAuthenticated(true);

            showNotification(
              `Welcome ${result.user.name}! You're signed in for 24 hours.`,
              "success"
            );

            // Clean up URL and redirect to homepage
            console.log("✅ OAuth success, redirecting to homepage...");
            setTimeout(() => {
              router.replace("/");
            }, 1500);
          } else {
            console.log("❌ OAuth callback failed:", result.message);
            showNotification(
              result.message || "Authentication failed. Please try again.",
              "error"
            );
            router.push("/login");
          }
        } else {
          // No OAuth data found, redirect to login
          console.log("⚠️ No OAuth data found in URL parameters");
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ OAuth processing error:", error);
        showNotification("Authentication error. Please try again.", "error");
        router.push("/login");
      }
    };

    processOAuth();
  }, [router, setUserData, setAuthenticated, showNotification]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" color="text.primary">
        Completing authentication...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we sign you in
      </Typography>
    </Box>
  );
}
