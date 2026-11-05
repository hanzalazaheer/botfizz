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
import { requireAuth } from "../middlewares/auth.middleware";
import * as webhooksController from "../controllers/webhooks.controller";

export function registerWebhookRoutes(app: Express) {
  // Webhook config management — requires authentication
  app.get("/api/webhook-configs-channel-id/:id", requireAuth, webhooksController.getWebhookConfigsByChannelId);
  app.get("/api/webhook-configs", requireAuth, webhooksController.getWebhookConfigs);
  app.post("/api/webhook-configs", requireAuth, webhooksController.createWebhookConfig);
  app.patch("/api/webhook-configs/:id", requireAuth, webhooksController.updateWebhookConfig);
  app.delete("/api/webhook-configs/:id", requireAuth, webhooksController.deleteWebhookConfig);
  app.post("/api/webhook-configs/:id/test", requireAuth, webhooksController.testWebhook);
  app.get("/api/webhook/global-url", requireAuth, webhooksController.getGlobalWebhookUrl);

  // Public webhook receiver endpoints — called by external services (WhatsApp, payment gateways)
  app.all("/webhook/global", webhooksController.handleWebhook);
  app.all("/webhook/:id", webhooksController.handleWebhook);

  // ==================== PAYMENT WEBHOOKS ====================
  app.post('/webhooks/razorpay', webhooksController.razorpayWebhook);
  app.post('/webhooks/stripe', webhooksController.stripeWebhook);
  app.post('/webhooks/paypal', webhooksController.paypalWebhook);
  app.post('/webhooks/paystack', webhooksController.paystackWebhook);
  app.post('/webhooks/mercadopago', webhooksController.mercadopagoWebhook);
} 
