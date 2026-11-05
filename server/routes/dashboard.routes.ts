/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import type { Express } from "express";
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import * as dashboardController from "../controllers/dashboard.controller";
import { extractChannelId } from "../middlewares/channel.middleware";
import { requireAuth, requirePermission } from "../middlewares/auth.middleware";
import { PERMISSIONS } from "@shared/schema";


export function registerDashboardRoutes(app: Express) {
  // Get dashboard statistics — SECURITY: requireAuth added
  app.get("/api/dashboard/stats",
    requireAuth,
    extractChannelId,
    dashboardController.getDashboardStats
  );

  // Admin-only dashboard — SECURITY: requireAuth added
  app.get("/api/dashboard/admin/stats", requireAuth, dashboardController.getDashboardStatsForAdmin);
  // User dashboard — SECURITY: requireAuth added
  app.get("/api/dashboard/user/stats", requireAuth, dashboardController.getDashboardStatsForUser);

  // Get analytics data
  app.get("/api/analytics",
    requireAuth,
    extractChannelId,
    requirePermission(PERMISSIONS.ANALYTICS_VIEW),
    dashboardController.getAnalytics
  );

  // Create analytics entry — SECURITY: requireAuth added
  app.post("/api/analytics", requireAuth, dashboardController.createAnalytics);
}