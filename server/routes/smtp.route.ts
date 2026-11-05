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
import {
  getSMTPConfigHandler,
  upsertSMTPConfig,
  sendMailRoute,
  testSMTPConnection,
} from "../controllers/smtp.controller";
import { upload, handleDigitalOceanUpload } from "../middlewares/upload.middleware";
import type { Express } from "express";

export function registerSMTPRoutes(app: Express) {
  // POST create or update SMTP Config
  app.post("/api/admin/smtpConfig", requireAuth, requireRole("superadmin"), upsertSMTPConfig);

  // Get SMTP Config
  app.get("/api/admin/getSmtpConfig", requireAuth, requireRole("superadmin"), getSMTPConfigHandler);  

  app.post("/api/admin/smtp/upload-logo", requireAuth, requireRole("superadmin"), upload.single('logo'), handleDigitalOceanUpload, async (req, res) => {
    try {
      const file = req.file as any;
      if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      const logoUrl = file.cloudUrl || `/uploads/${file.filename}`;
      res.json({ success: true, url: logoUrl });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to process SMTP request" });
    }
  });

  app.post("/api/admin/smtp/test", requireAuth, requireRole("superadmin"), testSMTPConnection);

  app.post("/api/contact/sendmail", sendMailRoute);
}
