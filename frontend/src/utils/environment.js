const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Remove any trailing slashes for consistency
const server = BACKEND_URL.endsWith("/")
  ? BACKEND_URL.slice(0, -1)
  : BACKEND_URL;

export default server;
