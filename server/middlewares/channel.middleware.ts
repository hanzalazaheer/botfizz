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
import { AppError } from './error.middleware';

export interface RequestWithChannel extends Request {
  activeChannel?: any;
  channelId?: string;
}

export async function requireActiveChannel(
  req: RequestWithChannel,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionUser = (req as any).session?.user;
    const userId: string | undefined = sessionUser?.id;

    if (!userId) {
      throw new AppError(401, "Authentication required");
    }

    const ownerId = sessionUser?.role === "team" ? sessionUser?.createdBy : userId;
    const activeChannel = ownerId
      ? await storage.getActiveChannelByUserId(ownerId)
      : undefined;

    if (!activeChannel) {
      throw new AppError(400, "No active channel found. Please configure a channel first.");
    }

    req.activeChannel = activeChannel;
    req.channelId = activeChannel.id;
    next();
  } catch (error) {
    next(error);
  }
}

export async function extractChannelId(
  req: RequestWithChannel,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionUser = (req as any).session?.user;
    const userId: string | undefined = sessionUser?.id;

    // Check query parameter first
    let channelId = req.query.channelId as string | undefined;

    if (channelId && userId && sessionUser?.role !== 'superadmin') {
      // Verify the requested channelId actually belongs to this user
      const ownerId = sessionUser?.role === 'team' ? sessionUser?.createdBy : userId;
      const userChannels = ownerId ? await storage.getChannelsByUserId(ownerId) : [];
      if (!userChannels.some((ch: any) => ch.id === channelId)) {
        // Requested channel doesn't belong to this user — ignore it and use their own
        channelId = undefined;
      }
    }

    // If not in query (or rejected above), use user's own active channel
    if (!channelId && userId) {
      const ownerId = sessionUser?.role === 'team' ? sessionUser?.createdBy : userId;
      const activeChannel = ownerId
        ? await storage.getActiveChannelByUserId(ownerId)
        : undefined;
      if (activeChannel) channelId = activeChannel.id;
    }

    req.channelId = channelId;
    next();
  } catch (error) {
    next(error);
  }
}