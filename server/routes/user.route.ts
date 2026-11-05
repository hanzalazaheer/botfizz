/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { requireAuth, requireRole } from "server/middlewares/auth.middleware";
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  bulkUpdateUserStatus,
  verifyEmailOTP,
  resendOTP,
  createUserSuperadmin,
  exportAllUsers
} from "../controllers/user.controller";
import type { Express } from "express";

const SA = requireRole("superadmin");

export function userRoutes(app: Express) {
  // Superadmin-only user management
  app.get("/api/admin/users/export", requireAuth, SA, exportAllUsers);
  app.get("/api/admin/users", requireAuth, SA, getAllUsers);
  app.get("/api/admin/users/:id", requireAuth, SA, getUserById);
  app.post("/api/admin/users/create", requireAuth, SA, createUserSuperadmin);
  app.put("/api/admin/users/bulk-status", requireAuth, SA, bulkUpdateUserStatus);
  app.delete("/api/admin/users/:id", requireAuth, SA, deleteUser);
  app.put("/api/user/status/:id", requireAuth, SA, updateUserStatus);

  // Self-service (no role required, just auth where needed)
  app.post("/api/users/create", createUser);          // public registration
  app.post("/api/users/verifyEmail", verifyEmailOTP); // public email verification
  app.post("/api/users/resend-otp", resendOTP);       // public OTP resend
  app.put("/api/users/:id", requireAuth, updateUser); // authenticated self-update
}
