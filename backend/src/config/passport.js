import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Configure Google OAuth Strategy
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

        // Check if user exists with the same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0]?.value || user.avatar;
          await user.save();
          console.log("🔗 Linked Google account to existing user:", user.email);
          return done(null, user);
        }

        // Create new user
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          username:
            profile.emails[0].value.split("@")[0] + "_" + profile.id.slice(-6),
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

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
