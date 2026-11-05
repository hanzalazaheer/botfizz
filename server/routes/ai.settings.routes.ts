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
import {
  getAISettings,
  createAISettings,
  updateAISettings,
  deleteAISettings,
  getAISettingByChannelId
} from "../controllers/ai.settings.controller";
import type { Express } from "express";

export function registerAISettingsRoutes(app: Express) {

app.get("/api/ai-settings", getAISettings);
app.post("/api/ai-settings", createAISettings);
app.put("/api/ai-settings/:id", updateAISettings);
app.delete("/api/ai-settings/:id", deleteAISettings);
app.get("/api/ai-settings/channel/:channelId", getAISettingByChannelId);

}
