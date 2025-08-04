import express from "express";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  const healthCheck = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    features: {
      googleOAuth: !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_CALLBACK_URL
      ),
      database: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET,
    },
    missing: [],
  };

  // Check for missing critical environment variables
  const requiredVars = ["MONGODB_URI", "JWT_SECRET", "PORT"];

  const optionalVars = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",
    "FRONTEND_URL",
  ];

  // Check required variables
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      healthCheck.missing.push({ variable: varName, type: "required" });
      healthCheck.status = "WARNING";
    }
  });

  // Check optional variables (for features)
  optionalVars.forEach((varName) => {
    if (!process.env[varName]) {
      healthCheck.missing.push({ variable: varName, type: "optional" });
    }
  });

  const statusCode = healthCheck.status === "OK" ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Configuration status endpoint (for debugging)
router.get("/config", (req, res) => {
  const config = {
    googleOAuth: {
      enabled: !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_CALLBACK_URL
      ),
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasCallbackUrl: !!process.env.GOOGLE_CALLBACK_URL,
    },
    database: {
      configured: !!process.env.MONGODB_URI,
    },
    jwt: {
      configured: !!process.env.JWT_SECRET,
    },
    server: {
      port: process.env.PORT || 8000,
      environment: process.env.NODE_ENV || "development",
      frontendUrl: process.env.FRONTEND_URL || "Not set",
    },
  };

  res.json(config);
});

export default router;
