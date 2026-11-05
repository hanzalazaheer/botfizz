/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import type { Express } from 'express';
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import { getMessageLogs, updateMessageStatus } from '../controllers/messages.logs.controller';
import { requireAuth } from '../middlewares/auth.middleware';

export function registerMessageLogsRoutes(app: Express) {
  app.get('/api/messages/logs', requireAuth, getMessageLogs);

  app.put('/api/messages/:messageId/status', requireAuth, updateMessageStatus);
}