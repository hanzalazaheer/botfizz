/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import express from "express";
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
  getStorageSettings,
  getActiveStorage,
  updateStorageSetting,
  deleteStorageSetting,
  testStorageConnection,
} from "../controllers/storage.settings.controller";
import type { Express } from "express";

const SA = requireRole("superadmin");

export function registerStorageSettingsRoutes(app: Express) {
  app.get("/api/storage-settings", requireAuth, SA, getStorageSettings);
  app.get("/api/storage-settings/active", requireAuth, SA, getActiveStorage);
  app.post("/api/storage-settings/update", requireAuth, SA, updateStorageSetting);
  app.post("/api/storage-settings/test", requireAuth, SA, testStorageConnection);
  app.delete("/api/storage-settings/:id", requireAuth, SA, deleteStorageSetting);
}
