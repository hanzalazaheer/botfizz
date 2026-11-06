/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * ============================================================
 */

import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { requireAuth } from "server/middlewares/auth.middleware";
import { SANDBOX_MODE, simulateInboundMessage } from "../sandbox";
import {
  DEMO_LOGINS,
  ensureDemoAccounts,
  provisionWorkspace,
} from "../services/sandbox-workspace";
import { db } from "../db";
import { contacts } from "@shared/schema";
import { storage } from "../storage";

const ownerOf = (req: Request) => {
  const user = (req.session as any).user;
  return user.role === "team" && user.createdBy ? user.createdBy : user.id;
};

const INBOUND_SAMPLES = [
  "Hi! Do you ship internationally?",
  "Can I change my delivery address?",
  "Is there a discount for first-time customers?",
  "How do I track my order?",
  "Are you open on Sundays?",
];

export function registerSandboxRoutes(app: Express) {
  app.get("/api/sandbox/status", (_req, res) => {
    res.json(SANDBOX_MODE ? { enabled: true, demoLogins: DEMO_LOGINS } : { enabled: false });
  });

  if (!SANDBOX_MODE) return;

  ensureDemoAccounts().catch((err) =>
    console.error("[Sandbox] Could not create demo accounts:", err),
  );

  app.post("/api/sandbox/provision", requireAuth, async (req: Request, res: Response) => {
    const channel = await provisionWorkspace(ownerOf(req));
    res.json({ success: true, channel });
  });

  app.post("/api/sandbox/simulate-inbound", requireAuth, async (req: Request, res: Response) => {
    const channel = await storage.getActiveChannelByUserId(ownerOf(req));
    if (!channel) {
      return res.status(400).json({ error: "Set up a channel first." });
    }

    const list = await db
      .select()
      .from(contacts)
      .where(eq(contacts.channelId, channel.id));
    if (list.length === 0) {
      return res.status(400).json({ error: "Add a contact first." });
    }

    const contact = list[Math.floor(Math.random() * list.length)];
    const text = INBOUND_SAMPLES[Math.floor(Math.random() * INBOUND_SAMPLES.length)];
    await simulateInboundMessage(channel.phoneNumberId, contact.phone, contact.name, text);
    res.json({ success: true, from: contact.name, text });
  });
}
