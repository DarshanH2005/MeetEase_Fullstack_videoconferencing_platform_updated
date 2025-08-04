// Use environment variables for deployment flexibility
const IS_PROD = process.env.NODE_ENV === "production";

// Base server URL without /api/v1 to prevent double paths
const baseServer = IS_PROD
  ? "https://meetease-fullstack-videoconferencing.onrender.com"
  : "http://localhost:8000";

const server = process.env.NEXT_PUBLIC_API_URL || `${baseServer}/api/v1`;

export const OAUTH_CONFIG = {
  API_BASE_URL: server,
  FRONTEND_URL:
    process.env.NEXT_PUBLIC_FRONTEND_URL ||
    (IS_PROD
      ? "https://meet-ease-fullstack-videoconferenci.vercel.app"
      : "http://localhost:3000"),
  GOOGLE_AUTH_URL: `${server}/auth/google`,
  OAUTH_SUCCESS_URL:
    process.env.NEXT_PUBLIC_OAUTH_SUCCESS_URL ||
    (IS_PROD
      ? "https://meet-ease-fullstack-videoconferenci.vercel.app/auth/success"
      : "http://localhost:3000/auth/success"),
};

export default server;
