// Frontend authentication utilities
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Token management
export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('meetease_auth_token');
  }
  return null;
};

export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meetease_auth_token', token);
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('meetease_auth_token');
    localStorage.removeItem('meetease_user_data');
  }
};

// User data management
export const getUserData = () => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('meetease_user_data');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const setUserData = (userData) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('meetease_user_data', JSON.stringify(userData));
  }
};

// API request helper with auth - returns success/error object instead of throwing
export const authRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: true,
        message: data.message || 'Something went wrong',
        status: response.status
      };
    }

    return {
      success: true,
      ...data
    };
  } catch (error) {
    return {
      success: false,
      error: true,
      message: 'Network error. Please check your connection.',
      originalError: error.message
    };
  }
};

// Auth API functions
export const loginUser = async (email, password) => {
  const result = await authRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  // If successful, store auth data
  if (result.success && result.token) {
    setAuthToken(result.token);
    setUserData(result.user);
  }

  return result;
};

export const registerUser = async (name, username, email, password) => {
  const result = await authRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify({ name, username, email, password }),
  });

  // If successful, store auth data
  if (result.success && result.token) {
    setAuthToken(result.token);
    setUserData(result.user);
  }

  return result;
};

export const getUserProfile = async () => {
  return await authRequest('/users/profile');
};

export const updateUserProfile = async (profileData) => {
  return await authRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
};

export const logoutUser = () => {
  removeAuthToken();
  // Redirect to home page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

// Check if user is authenticated
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
  authRequest,
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  isAuthenticated,
};
