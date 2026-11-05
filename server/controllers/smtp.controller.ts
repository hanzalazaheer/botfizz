/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { Request, Response } from 'express';
import { AppError, asyncHandler as _dHandler, botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import { db } from '../db';
import { smtpConfig } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { sendContactEmail, resetEmailCache } from 'server/services/email.service';
import { cacheGet, cacheInvalidate, CACHE_KEYS, CACHE_TTL } from '../services/cache';

export const upsertSMTPConfig = async (req: Request, res: Response) => {
  try {
    const {
      host,
      port,
      secure,
      user,
      password,
      fromName,
      fromEmail,
      logo,
    } = req.body;

    // Check if a config already exists
    const existingConfig = await db.select().from(smtpConfig).limit(1);

    let updateData: any = {
      host,
      port,
      secure,
      user,
      fromName,
      fromEmail,
      logo,
      updatedAt: new Date(),
    };
    if (password) {
      updateData.password = password;
    }

    let result;
    if (existingConfig.length > 0) {
      // Update existing
      result = await db
        .update(smtpConfig)
        .set(updateData)
        .where(eq(smtpConfig.id, existingConfig[0].id))
        .returning();
    } else {
      // Insert new
      result = await db
        .insert(smtpConfig)
        .values({
          host,
          port,
          secure,
          user,
          password,
          fromName,
          fromEmail,
          logo,
        })
        .returning();
    }

    await cacheInvalidate(CACHE_KEYS.smtpConfig());
    resetEmailCache();

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('SMTP upsert error:', error);
    res
      .status(500)
      .json({ success: false, message: 'Failed to save SMTP config' });
  }
};

// GET SMTP configuration
export const getSMTPConfigHandler = async (req: Request, res: Response) => {
  try {
    // Assuming there's only one SMTP config row
    const config = await db.select().from(smtpConfig).limit(1);

    if (!config || config.length === 0) {
      return res.status(404).json({
        success: false,
        message: "SMTP configuration not found",
      });
    }

    res.status(200).json({
      success: true,
      data: config[0],
    });
  } catch (error) {
    console.error("SMTP fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch SMTP configuration",
    });
  }
};


export const getSMTPConfig = async () => {
  return cacheGet(CACHE_KEYS.smtpConfig(), CACHE_TTL.smtpConfig, async () => {
    const configs = await db.select().from(smtpConfig).limit(1);
    if (!configs || configs.length === 0) {
      console.warn('⚠️ No SMTP configuration found');
      return null;
    }
    return configs[0];
  });
};



export const testSMTPConnection = async (req: Request, res: Response) => {
  try {
    const { verifyEmailConfiguration } = await import("server/services/email.service");
    const ok = await verifyEmailConfiguration();
    if (ok) {
      return res.json({ success: true, message: "SMTP connection verified successfully." });
    }
    return res.status(400).json({ success: false, message: "SMTP connection failed. Check host, port, and credentials." });
  } catch (error: any) {
    console.error("SMTP test error:", error);
    return res.status(500).json({ success: false, message: error.message || "SMTP test failed." });
  }
};

export const sendMailRoute = async (req: Request, res: Response) => {
  try {
    const { name, email, company, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const result = await sendContactEmail({
      name,
      email,
      company,
      subject,
      message,
    });

    console.log("Contact form email sent:", result);

    return res.json({
      success: true,
      message: "Message sent successfully",
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
}
