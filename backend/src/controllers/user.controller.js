import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth.js";

import crypto from "crypto";
import { sendMail } from "../utils/mailer.js";
// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(200)
        .json({ message: "If your email exists, a reset link has been sent." });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 min
    await user.save();

    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: "Reset your MeetEase password",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 30 minutes.</p>`,
    });
    return res
      .status(200)
      .json({ message: "If your email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Failed to process request" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res
        .status(400)
        .json({ message: "Token and new password required" });
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Failed to reset password" });
  }
};

const login = async (req, res) => {
  try {
    console.log("🔐 Login attempt received");
    console.log("📩 Request body:", req.body);

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log("❌ Missing email or password");
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Email and password are required",
      });
    }

    console.log("🔍 Looking for user with email/username:", email);

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });

    if (!user) {
      console.log("❌ User not found for:", email);
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
    }

    console.log("✅ User found:", user.email);

    // Compare passwords using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for user:", user.email);
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid credentials",
      });
    }

    console.log("✅ Password verified for user:", user.email);

    // Generate JWT token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    console.log("🎉 Login successful for user:", user.email);

    // Return success response with token and user data
    return res.status(httpStatus.OK).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("🚨 Login error:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong during login",
    });
  }
};

const register = async (req, res) => {
  try {
    console.log("📝 Registration attempt received");
    console.log("📩 Request body:", req.body);

    const { name, username, email, password } = req.body;

    // Validate input
    if (!name || !username || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "All fields are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format:", email);
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Invalid email format",
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Password too short");
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Password must be at least 6 characters long",
      });
    }

    console.log(
      "🔍 Checking if user already exists with email/username:",
      email,
      username
    );

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      console.log(
        "❌ User already exists with",
        field,
        ":",
        existingUser[field]
      );
      return res.status(httpStatus.CONFLICT).json({
        message: `User with this ${field} already exists`,
      });
    }

    console.log("✅ Creating new user");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      name: name.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: true, // Set to true for now, implement email verification later
    });

    await user.save();
    console.log("✅ User created successfully:", user.email);

    // Generate JWT token
    const token = generateToken(user._id);

    console.log("🎉 Registration successful for user:", user.email);

    // Return success response
    return res.status(httpStatus.CREATED).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("🚨 Registration error:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Something went wrong during registration",
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    return res.status(httpStatus.OK).json({
      user: req.user, // Set by auth middleware
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Failed to get user profile",
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    console.log("🔄 Updating profile for user:", req.user._id);
    console.log("📥 Update data:", req.body);

    const { name, avatar, preferences, password } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log("❌ User not found");
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found",
      });
    }

    // Update name if provided
    if (name && name.trim() !== "") {
      user.name = name.trim();
      console.log("✅ Name updated to:", user.name);
    }

    // Update avatar if provided
    if (avatar !== undefined) {
      user.avatar = avatar;
      console.log("✅ Avatar updated");
    }

    // Update preferences if provided
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
      console.log("✅ Preferences updated");
    }

    // Update password if provided
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        console.log("❌ Password too short");
        return res.status(httpStatus.BAD_REQUEST).json({
          message: "Password must be at least 6 characters long",
        });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      console.log("✅ Password updated");
    }

    await user.save();
    console.log("✅ Profile saved successfully");

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    return res.status(httpStatus.OK).json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update profile",
    });
  }
};

// Add meeting to user history
const addMeetingActivity = async (req, res) => {
  try {
    const { meetingId, action, duration } = req.body;
    const user = await User.findById(req.user._id);

    if (action === "join") {
      user.meetingHistory.push({
        meetingId,
        joinedAt: new Date(),
        duration: duration || 0,
      });
    }

    await user.save();

    return res.status(httpStatus.OK).json({
      message: "Meeting activity recorded",
      meetingHistory: user.meetingHistory,
    });
  } catch (error) {
    console.error("Add meeting activity error:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Failed to record meeting activity",
    });
  }
};

// Get user meeting history
const getMeetingHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(httpStatus.OK).json({
      meetingHistory: user.meetingHistory,
    });
  } catch (error) {
    console.error("Get meeting history error:", error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "Failed to get meeting history",
    });
  }
};

export {
  login,
  register,
  getProfile,
  updateProfile,
  addMeetingActivity,
  getMeetingHistory,
  forgotPassword,
  resetPassword,
};
