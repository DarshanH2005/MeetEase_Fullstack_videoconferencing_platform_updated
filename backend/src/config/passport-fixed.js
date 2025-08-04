import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.warn(
    `⚠️  Google OAuth disabled - Missing environment variables: ${missingVars.join(
      ", "
    )}`
  );
  console.warn("ℹ️  Set these variables to enable Google OAuth functionality");
  console.warn(
    "🔧 Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL to your environment"
  );
} else {
  // Configure Google OAuth Strategy only if all required vars are present
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log("🔐 Google OAuth profile received:", {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
          });

          // Check if user already exists with this Google ID
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            console.log("✅ Existing Google user found:", user.email);
            return done(null, user);
          }

          // Create new user
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            username:
              profile.emails[0].value.split("@")[0] +
              "_" +
              profile.id.slice(-6),
            email: profile.emails[0].value,
            avatar: profile.photos?.[0]?.value,
            isVerified: true, // Google accounts are considered verified
            authProvider: "google",
          });

          await newUser.save();
          console.log("✅ New Google user created:", newUser.email);
          return done(null, newUser);
        } catch (error) {
          console.error("❌ Google OAuth error:", error);
          return done(error, null);
        }
      }
    )
  );

  console.log("✅ Google OAuth strategy configured successfully");
}

// Serialize user for session (always needed)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session (always needed)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to generate JWT tokens for Google OAuth
export const generateGoogleJWT = (user) => {
  const payload = {
    userId: user._id,
    email: user.email,
    name: user.name,
    authProvider: "google",
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h", // 24 hour expiry
  });
};

export default passport;
