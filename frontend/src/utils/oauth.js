// OAuth utilities for Google authentication
import { OAUTH_CONFIG } from "./environment";

// Start Google OAuth flow with state parameter for security
export const loginWithGoogle = (intent = "login") => {
  console.log("🔐 Starting Google OAuth flow...", { intent });

  // Generate state parameter for security
  const state = generateSecureState(intent);

  // Store state in localStorage for verification
  localStorage.setItem("oauth_state", state);

  // Redirect to backend Google OAuth endpoint with state
  const oauthUrl = `${OAUTH_CONFIG.GOOGLE_AUTH_URL}?state=${state}`;
  window.location.href = oauthUrl;
};

// Generate secure state parameter
const generateSecureState = (intent) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const intentParam = intent === "register" ? "reg" : "login";
  return `${intentParam}_${timestamp}_${random}`;
};

// Verify state parameter for security
const verifyState = (receivedState) => {
  const storedState = localStorage.getItem("oauth_state");
  localStorage.removeItem("oauth_state"); // Clean up

  if (!storedState || storedState !== receivedState) {
    console.error("❌ OAuth state mismatch - possible CSRF attack");
    return false;
  }

  return true;
};

// Handle OAuth success callback with enhanced security
export const handleOAuthCallback = (token, userData, state) => {
  try {
    console.log("✅ OAuth callback received:", {
      token: !!token,
      userData: userData?.email,
      state: !!state,
    });

    // Verify state parameter for security
    if (state && !verifyState(state)) {
      return {
        success: false,
        message: "Security verification failed. Please try again.",
      };
    }

    if (token && userData) {
      // Store auth data with expiry timestamp
      const authData = {
        token,
        user: userData,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        loginTime: Date.now(),
      };

      localStorage.setItem("meetease_auth_token", token);
      localStorage.setItem("meetease_user_data", JSON.stringify(userData));
      localStorage.setItem(
        "meetease_auth_expiry",
        authData.expiresAt.toString()
      );

      console.log(
        "✅ OAuth authentication successful, data stored with 24h expiry"
      );
      return { success: true, user: userData, token };
    } else {
      console.log("❌ OAuth callback missing required data");
      return { success: false, message: "Authentication failed" };
    }
  } catch (error) {
    console.error("❌ OAuth callback error:", error);
    return { success: false, message: "Authentication error" };
  }
};

// Check for OAuth URL parameters with enhanced security
export const checkOAuthParams = () => {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  const userParam = urlParams.get("user");
  const state = urlParams.get("state");
  const error = urlParams.get("error");

  if (error) {
    console.log("❌ OAuth error:", error);
    return { error };
  }

  if (token && userParam) {
    try {
      const userData = JSON.parse(decodeURIComponent(userParam));
      return { token, userData, state };
    } catch (e) {
      console.error("❌ Error parsing OAuth user data:", e);
      return { error: "invalid_data" };
    }
  }

  return null;
};

// Check if auth token is expired (24-hour check)
export const isAuthExpired = () => {
  const expiry = localStorage.getItem("meetease_auth_expiry");
  if (!expiry) return true;

  const expiryTime = parseInt(expiry);
  const now = Date.now();

  if (now > expiryTime) {
    console.log("🔄 Auth token expired, clearing storage");
    // Clear expired auth data
    localStorage.removeItem("meetease_auth_token");
    localStorage.removeItem("meetease_user_data");
    localStorage.removeItem("meetease_auth_expiry");
    return true;
  }

  return false;
};

// Get remaining auth time in hours
export const getAuthTimeRemaining = () => {
  const expiry = localStorage.getItem("meetease_auth_expiry");
  if (!expiry) return 0;

  const expiryTime = parseInt(expiry);
  const now = Date.now();
  const remaining = expiryTime - now;

  return Math.max(0, Math.floor(remaining / (1000 * 60 * 60))); // Convert to hours
};

// Clean up OAuth state - useful for logout or error recovery
export const cleanupOAuthState = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("oauth_state");
    console.log("🧹 OAuth state cleaned up");
  }
};

export default {
  loginWithGoogle,
  handleOAuthCallback,
  checkOAuthParams,
  cleanupOAuthState,
};
