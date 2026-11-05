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
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  syncPlanToGateway,
  syncAllPlansToGateways,
} from "../controllers/plans.controller";
import type { Express } from "express";

export function registerPlansRoutes(app: Express) {
  app.get("/api/admin/plans", requireAuth, requireRole("superadmin"), getAllPlans);

  app.get("/api/admin/plans/:id", requireAuth, requireRole("superadmin"), getPlanById);

  app.post("/api/admin/plans", requireAuth, requireRole("superadmin"), createPlan);

  app.put("/api/admin/plans/:id", requireAuth, requireRole("superadmin"), updatePlan);

  app.delete("/api/admin/plans/:id", requireAuth, requireRole("superadmin"), deletePlan);

  app.post("/api/admin/plans/:id/sync-gateway", requireAuth, requireRole("superadmin"), syncPlanToGateway);

  app.post("/api/admin/plans/sync-all-gateways", requireAuth, requireRole("superadmin"), syncAllPlansToGateways);
}
