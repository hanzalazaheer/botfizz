/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import type { Request, Response, NextFunction } from 'express';
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import { storage } from '../storage';

/** Effective tenant owner id for DB scoping (team → admin `createdBy`). */
export function getSessionOwnerId(sessionUser: {
  id?: string;
  role?: string;
  createdBy?: string | null;
} | null | undefined): string | undefined {
  if (!sessionUser?.id) return undefined;
  return sessionUser.role === 'team' && sessionUser.createdBy
    ? sessionUser.createdBy
    : sessionUser.id;
}

export async function resolveTenantChannels(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = (req.session as any)?.user || (req as any).user;
    
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (user.role === 'superadmin') {
      (req as any).isSuperAdmin = true;
      (req as any).tenantChannelIds = null;
      return next();
    }

    const ownerId = getSessionOwnerId(user);
    
    if (!ownerId) {
      (req as any).isSuperAdmin = false;
      (req as any).tenantChannelIds = [];
      return next();
    }

    const channels = await storage.getChannelsByUserId(ownerId);
    const channelIds = channels.map((ch: any) => ch.id);

    (req as any).isSuperAdmin = false;
    (req as any).tenantChannelIds = channelIds;
    next();
  } catch (error) {
    next(error);
  }
}

export function verifyChannelOwnership(
  req: Request,
  channelId: string
): boolean {
  if ((req as any).isSuperAdmin) return true;
  const tenantChannelIds: string[] = (req as any).tenantChannelIds || [];
  return tenantChannelIds.includes(channelId);
}
