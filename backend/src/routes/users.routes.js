import { Router } from "express";
import {
  login,
  register,
  getProfile,
  updateProfile,
  addMeetingActivity,
  getMeetingHistory,
  forgotPassword,
  resetPassword,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Forgot/reset password
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

// Public routes (no authentication required)
router.route("/login").post(login);
router.route("/register").post(register);

// Protected routes (authentication required)
router.route("/profile").get(authenticateToken, getProfile);
router.route("/profile").put(authenticateToken, updateProfile);
router.route("/add_to_activity").post(authenticateToken, addMeetingActivity);
router.route("/get_activity").get(authenticateToken, getMeetingHistory);

export default router;
