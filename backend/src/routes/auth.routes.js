import { Router } from "express";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import crypto from "crypto";

const router = Router();

// State storage for CSRF protection (in production, use Redis or database)
const oauthStates = new Map();

// Google OAuth routes with enhanced security
router.get("/google", (req, res, next) => {
  // Generate secure state parameter for CSRF protection
  const state = crypto.randomBytes(32).toString("hex");
  const timestamp = Date.now();

  // Store state with expiry (10 minutes)
  oauthStates.set(state, {
    timestamp,
    expires: timestamp + 10 * 60 * 1000, // 10 minutes
  });

  // Clean up expired states
  cleanupExpiredStates();

  console.log("🔐 Generated OAuth state:", state);

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: state,
  })(req, res, next);
});

// Google OAuth callback with enhanced security
router.get(
  "/google/callback",
  (req, res, next) => {
    const { state, error } = req.query;

    // Check for OAuth errors
    if (error) {
      console.log("❌ OAuth error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/login?error=${encodeURIComponent(
          error
        )}`
      );
    }

    // Verify state parameter for CSRF protection
    if (!state || !oauthStates.has(state)) {
      console.log("❌ Invalid or missing OAuth state");
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/login?error=invalid_state`
      );
    }

    const stateData = oauthStates.get(state);
    const now = Date.now();

    // Check if state has expired
    if (now > stateData.expires) {
      oauthStates.delete(state);
      console.log("❌ OAuth state expired");
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/login?error=state_expired`
      );
    }

    // Clean up used state
    oauthStates.delete(state);

    next();
  },
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        console.log("❌ No user found in OAuth callback");
        return res.redirect(
          `${process.env.FRONTEND_URL}/auth/login?error=oauth_failed`
        );
      }

      console.log("✅ Google OAuth successful for user:", user.email);

      // Generate JWT token with 24-hour expiry
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          isOAuth: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
      );

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      console.log("🎉 JWT token generated for Google OAuth user (24h expiry)");

      // Redirect to frontend with token and enhanced user data
      const redirectUrl = `${
        process.env.FRONTEND_URL
      }/auth/success?token=${token}&user=${encodeURIComponent(
        JSON.stringify({
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          profilePicture: user.profilePicture,
          authProvider: user.authProvider,
          isOAuth: true,
        })
      )}`;

      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Google OAuth callback error:", error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=oauth_error`);
    }
  }
);

// OAuth success endpoint (for handling redirects)
router.get("/success", (req, res) => {
  res.json({
    success: true,
    message: "OAuth authentication successful",
  });
});

// Cleanup function for expired states
function cleanupExpiredStates() {
  const now = Date.now();
  for (const [state, data] of oauthStates.entries()) {
    if (now > data.expires) {
      oauthStates.delete(state);
    }
  }
}

// Cleanup expired states every 5 minutes
setInterval(cleanupExpiredStates, 5 * 60 * 1000);

export default router;
