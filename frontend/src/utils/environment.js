// Use environment variables for deployment flexibility
const IS_PROD = process.env.NODE_ENV === "production";

const server =
  process.env.NEXT_PUBLIC_API_URL ||
  (IS_PROD
    ? "https://meetease-fullstack-videoconferencing.onrender.com/api/v1"
    : "http://localhost:8000/api/v1");

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
