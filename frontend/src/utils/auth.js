// Frontend authentication utilities
// Use local backend for development, override with env var if set
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Token management with 24-hour expiry
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("meetease_auth_token");
    const expiry = localStorage.getItem("meetease_auth_expiry");

    if (!token || !expiry) {
      return null;
    }

    const expiryTime = parseInt(expiry);
    const now = Date.now();

    // Check if token has expired
    if (now > expiryTime) {
      console.log("🔄 Auth token expired, clearing storage");
      removeAuthToken();
      return null;
    }

    return token;
  }
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window !== "undefined") {
    // Calculate expiry time (24 hours from now)
    const expiryTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    localStorage.setItem("meetease_auth_token", token);
    localStorage.setItem("meetease_auth_expiry", expiryTime.toString());

    console.log("✅ Auth token saved with 24h expiry:", new Date(expiryTime));
  }
};

export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("meetease_auth_token");
    localStorage.removeItem("meetease_user_data");
    localStorage.removeItem("meetease_auth_expiry");
    localStorage.removeItem("oauth_state"); // Clean OAuth state too
    console.log("🧹 Auth data and OAuth state cleared");
  }
};

// Enhanced user data management with expiry check
export const getUserData = () => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem("meetease_user_data");
    const expiry = localStorage.getItem("meetease_auth_expiry");

    if (!userData || !expiry) {
      return null;
    }

    const expiryTime = parseInt(expiry);
    const now = Date.now();

    // Check if data has expired
    if (now > expiryTime) {
      console.log("🔄 User data expired, clearing storage");
      removeAuthToken();
      return null;
    }

    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const setUserData = (userData) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("meetease_user_data", JSON.stringify(userData));
  }
};

// Get remaining auth time in hours
export const getAuthTimeRemaining = () => {
  if (typeof window !== "undefined") {
    try {
      const expiry = localStorage.getItem("meetease_auth_expiry");
      if (!expiry) return 0;

      const expiryTime = parseInt(expiry);
      const now = Date.now();
      const remaining = expiryTime - now;

      return Math.max(0, Math.floor(remaining / (1000 * 60 * 60))); // Convert to hours
    } catch (error) {
      console.error("❌ Error calculating auth time remaining:", error);
      return 0;
    }
  }
  return 0;
};

// API request helper with auth - returns success/error object instead of throwing
export const authRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log("🌐 Making request to:", fullUrl);
    console.log("📤 Request options:", { ...options, headers });

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log("📊 Response status:", response.status, response.statusText);

    const data = await response.json();
    console.log("📦 Response data:", data);

    if (!response.ok) {
      return {
        success: false,
        error: true,
        message: data.message || "Something went wrong",
        status: response.status,
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error("🚨 Network error:", error);
    return {
      success: false,
      error: true,
      message: "Network error. Please check your connection.",
      originalError: error.message,
    };
  }
};

// Auth API functions
export const loginUser = async (email, password) => {
  console.log("🔐 Attempting login for:", email);
  console.log("📡 API URL:", `${API_BASE_URL}/users/login`);

  const result = await authRequest("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  console.log("📥 Login response:", result);

  // If successful, store auth data
  if (result.success && result.token) {
    setAuthToken(result.token);
    setUserData(result.user);
    console.log("✅ Login successful, token stored");
  } else {
    console.log("❌ Login failed:", result.message);
  }

  return result;
};

export const registerUser = async (name, username, email, password) => {
  console.log("📝 Attempting registration for:", email, "username:", username);
  console.log("📡 API URL:", `${API_BASE_URL}/users/register`);

  const result = await authRequest("/users/register", {
    method: "POST",
    body: JSON.stringify({ name, username, email, password }),
  });

  console.log("📥 Registration response:", result);

  // If successful, store auth data
  if (result.success && result.token) {
    setAuthToken(result.token);
    setUserData(result.user);
    console.log("✅ Registration successful, token stored");
  } else {
    console.log("❌ Registration failed:", result.message);
  }

  return result;
};

export const getUserProfile = async () => {
  return await authRequest("/users/profile");
};

export const updateUserProfile = async (profileData) => {
  return await authRequest("/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

// Enhanced logout with expiry cleanup
export const logoutUser = () => {
  console.log("🚪 Logging out user...");
  removeAuthToken();

  // Use simple redirect to avoid router complications
  if (typeof window !== "undefined") {
    // Small delay to ensure localStorage is cleared
    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  }
};

// Check if user is authenticated with expiry validation
export const isAuthenticated = () => {
  const token = getAuthToken();
  const userData = getUserData();
  return !!(token && userData);
};

export default {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getUserData,
  setUserData,
  getAuthTimeRemaining,
  authRequest,
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  isAuthenticated,
};
