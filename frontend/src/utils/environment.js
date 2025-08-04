let IS_PROD = true;

const server = IS_PROD
  ? "https://meetease-fullstack-videoconferencing.onrender.com"
  : "http://localhost:8000";

// OAuth configuration based on environment
export const OAUTH_CONFIG = {
  API_BASE_URL: server,
  FRONTEND_URL: IS_PROD
    ? "https://meet-ease-fullstack-videoconferenci.vercel.app" // Replace with your production domain
    : "http://localhost:3000",
  GOOGLE_AUTH_URL: `${server}/api/v1/auth/google`,
  OAUTH_SUCCESS_URL: IS_PROD
    ? "https://meet-ease-fullstack-videoconferenci.vercel.app/auth/success"
    : "http://localhost:3000/auth/success",
};

export default server;
