/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { z } from "zod";
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import type { Express } from "express";

import { insertAutomationSchema, insertAutomationNodeSchema } from "@shared/schema";
import { requireAuth } from "../middlewares/auth.middleware";
import { extractChannelId } from "../middlewares/channel.middleware";
// import * as automationController from "../controllers/automation.controller";

import {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  toggleAutomation,
  saveAutomationNodes,
  saveAutomationEdges,
  startAutomationExecution,
  logAutomationNodeExecution,
  getExecutionStatus,
  getAutomationExecutions,
  triggerNewConversation,
  triggerMessageReceived,
  seedAutomationTemplates
} from "../controllers/automation.controller";
import { cleanupExpiredExecutions, getAllPendingExecutions } from "server/controllers/webhooks.controller";
import { handleDigitalOceanUpload, upload } from "server/middlewares/upload.middleware";
import { requireSubscription } from "server/middlewares/requireSubscription";

// Schema for automation + nodes (used for builder save)
const automationWithNodesSchema = z.object({
  automation: insertAutomationSchema,
  nodes: z.array(insertAutomationNodeSchema),
});





export function registerAutomationRoutes(app: Express) {
  //
  // ─── AUTOMATION CRUD ──────────────────────────────────────────────
  //


  // Get all automations
  app.get(
    "/api/automations",
    requireAuth,
    extractChannelId,
    getAutomations
  );

  // Get single automation with nodes
  app.get(
    "/api/automations/:id",
    requireAuth,
    extractChannelId,
    getAutomation
  );

  // Create automation
  app.post(
    "/api/automations",
    requireAuth,
    extractChannelId,
    // requireSubscription("automation"),
    upload.any(),
    handleDigitalOceanUpload,
    createAutomation
  );

  // Update automation
  app.put(
    "/api/automations/:id",
    requireAuth,
    extractChannelId,
    upload.any(),
    handleDigitalOceanUpload,
    updateAutomation
  );

  // Delete automation
  app.delete(
    "/api/automations/:id",
    requireAuth,
    extractChannelId,
    deleteAutomation
  );

  // Toggle status active/inactive
  app.post(
    "/api/automations/:id/toggle",
    requireAuth,
    extractChannelId,
    toggleAutomation
  );

  // Upload a single media file immediately (used by the flow builder on file select)
  app.post(
    "/api/automations/upload-media",
    requireAuth,
    upload.single("file"),
    handleDigitalOceanUpload,
    (req: any, res: any) => {
      const file = req.file as (Express.Multer.File & { cloudUrl?: string }) | undefined;
      if (!file) return res.status(400).json({ error: "No file received" });
      const url = file.cloudUrl
        ? (file.cloudUrl.startsWith("http") ? file.cloudUrl : `${process.env.APP_URL || ""}/${file.cloudUrl}`)
        : `${(process.env.APP_URL || "").replace(/\/$/, "")}/uploads/${require("path").basename(require("path").dirname(file.path))}/${file.filename}`;
      res.json({ url });
    }
  );

  //
  // ─── NODES (visual builder) ──────────────────────────────────────
  //

  // Save automation nodes (bulk replace from builder)
  app.post(
    "/api/automations/:automationId/nodes",
    requireAuth,
    extractChannelId,
    saveAutomationNodes
  );

    // Save automation edges (bulk replace from builder)
  app.post(
    "/api/automations/:automationId/edges",
    requireAuth,
    extractChannelId,
    saveAutomationNodes
  );

  //
  // ─── EXECUTION ───────────────────────────────────────────────────
  //

  // Start execution for a contact/conversation
  app.post(
    "/api/automations/:automationId/executions",
    requireAuth,
    extractChannelId,
    startAutomationExecution
  );

  // Log node execution (worker will call this per node)
  app.post(
    "/api/automations/executions/:executionId/logs",
    requireAuth,
    extractChannelId,
    logAutomationNodeExecution
  );



// app.get("/", getAutomations);
// app.get("/:id", getAutomation);
// app.post("/", createAutomation);
// app.put("/:id", updateAutomation);
// app.delete("/:id", deleteAutomation);
// app.patch("/:id/toggle", toggleAutomation);

// Node and Edge Management
// app.post("/:automationId/nodes", saveAutomationNodes);
// app.post("/:automationId/edges", saveAutomationEdges);

// Execution
// SECURITY: requireAuth added to all execution/trigger routes
app.post("/api/automations/:automationId/execute", requireAuth, startAutomationExecution);
app.get("/api/automations/:id/executions", requireAuth, getAutomationExecutions);
app.get("/api/automations/executions/:executionId/status", requireAuth, getExecutionStatus);

// Logging — SECURITY: requireAuth added
app.post("/api/automations/executions/:executionId/logs", requireAuth, logAutomationNodeExecution);

// Triggers — SECURITY: requireAuth added
app.post("/api/automations/triggers/new-conversation", requireAuth, triggerNewConversation);
app.post("/api/automations/triggers/message-received", requireAuth, triggerMessageReceived);



app.get('/api/automations/pending-executions', requireAuth, getAllPendingExecutions);
app.post('/api/automations/cleanup-expired', requireAuth, cleanupExpiredExecutions);

app.post('/api/automations/seed-templates', requireAuth, seedAutomationTemplates);

}
