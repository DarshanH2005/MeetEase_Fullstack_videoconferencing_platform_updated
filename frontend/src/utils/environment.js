let IS_PROD = true;

const server = IS_PROD
  ? "https://meetease-fullstack-videoconferencing.onrender.com"
  : "http://localhost:8000";

// OAuth configuration based on environment
export const OAUTH_CONFIG = {
  API_BASE_URL: server,
  FRONTEND_URL: IS_PROD
    ? "https://meetease-fullstack-videoconferencing.onrender.com" // Replace with your production domain
    : "http://localhost:3001",
  GOOGLE_AUTH_URL: `${server}/api/v1/auth/google`,
  OAUTH_SUCCESS_URL: IS_PROD
    ? "https://meetease-fullstack-videoconferencing.onrender.com/auth/success"
    : "http://localhost:3001/auth/success",
};

export default server;
