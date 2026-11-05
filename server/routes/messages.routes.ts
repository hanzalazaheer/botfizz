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
import * as messagesController from "../controllers/messages.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { insertMessageSchema } from "@shared/schema";
import { handleDigitalOceanUpload, upload } from "../middlewares/upload.middleware";

export function registerMessageRoutes(app: Express) {
  // Get messages for conversation
  app.get("/api/conversations/:conversationId/messages", messagesController.getMessages);

  // Create message in conversation
  app.post("/api/conversations/:conversationId/messages",upload.single("media"),handleDigitalOceanUpload,
    messagesController.createMessage
  );

  // Send WhatsApp message
  app.post("/api/messages/send", messagesController.sendMessage);

  // get media url
  app.get("/api/messages/media-url", messagesController.getMediaUrl);
  
  
  // get media proxy
  app.get("/api/messages/media-proxy", messagesController.getMediaProxy);
  
}