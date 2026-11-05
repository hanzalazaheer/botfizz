/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { Express } from "express";
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import {
  saveWhatsappConfig,
  getMyWhatsappConfig,
  updateWhatsappConfig,
  deleteWhatsappConfig,
} from "../controllers/whatsappConfig.controller";
import { requireAuth, requireRole } from
  "server/middlewares/auth.middleware";

export function registerWhatsappConfigRoutes(
  app: Express
) {

  // Get config (all authenticated users can read - needed for embedded signup flow)
  app.get(
    "/api/embedded/config",
    requireAuth,
    getMyWhatsappConfig
  );

  // Create / Update (superadmin only)
  app.post(
    "/api/embedded/config",
    requireAuth,
    requireRole("superadmin"),
    saveWhatsappConfig
  );

  // Update by id (superadmin only)
  app.put(
    "/api/embedded/config/:id",
    requireAuth,
    requireRole("superadmin"),
    updateWhatsappConfig
  );

  // Delete (superadmin only)
  app.delete(
    "/api/embedded/config",
    requireAuth,
    requireRole("superadmin"),
    deleteWhatsappConfig
  );
}
