/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import type { Request, Response } from 'express';
import { asyncHandler as _dHandler } from "@botfizz/core";
import { storage } from '../storage';
import { insertAutomationSchema } from '@shared/schema';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import type { RequestWithChannel } from '../middlewares/channel.middleware';

// Resolve the effective owner ID for a session user (team members are scoped to their admin)
function getOwnerId(sessionUser: any): string | undefined {
  if (!sessionUser) return undefined;
  return sessionUser.role === 'team' ? sessionUser.createdBy : sessionUser.id;
}

// Verify an automation belongs to one of the user's channels; throws 403 if not
async function assertAutomationOwnership(automationId: string, sessionUser: any): Promise<void> {
  if (sessionUser?.role === 'superadmin') return;
  const ownerId = getOwnerId(sessionUser);
  if (!ownerId) throw new AppError(403, 'Unauthorized');
  const automation = await storage.getAutomation(automationId);
  if (!automation) throw new AppError(404, 'Automation not found');
  if (!automation.channelId) throw new AppError(403, 'Unauthorized');
  const userChannels = await storage.getChannelsByUserId(ownerId);
  if (!userChannels.some((ch: any) => ch.id === automation.channelId)) {
    throw new AppError(403, 'You do not have permission to access this automation');
  }
}

export const getAutomations = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const sessionUser = (req as any).session?.user;
  let channelId = (req.query.channelId as string | undefined)?.trim();

  const ownerId = getOwnerId(sessionUser);
  if (!ownerId) return res.json([]);

  if (channelId) {
    if (sessionUser?.role !== 'superadmin') {
      const userChannels = await storage.getChannelsByUserId(ownerId);
      if (!userChannels.some((ch: any) => ch.id === channelId)) {
        return res.json([]);
      }
    }
  } else {
    const activeChannel = await storage.getActiveChannelByUserId(ownerId);
    if (!activeChannel) return res.json([]);
    channelId = activeChannel.id;
  }

  const automations = await storage.getAutomationsByChannel(channelId);
  res.json(automations);
});

export const getAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sessionUser = (req as any).session?.user;
  await assertAutomationOwnership(id, sessionUser);
  const automation = await storage.getAutomation(id);
  if (!automation) throw new AppError(404, 'Automation not found');
  res.json(automation);
});

export const createAutomation = asyncHandler(async (req: RequestWithChannel, res: Response) => {
  const sessionUser = (req as any).session?.user;
  const validatedAutomation = insertAutomationSchema.parse(req.body);

  let channelId = validatedAutomation.channelId;
  if (!channelId) {
    const ownerId = getOwnerId(sessionUser);
    const activeChannel = ownerId
      ? await storage.getActiveChannelByUserId(ownerId)
      : undefined;
    if (activeChannel) channelId = activeChannel.id;
  } else if (sessionUser?.role !== 'superadmin') {
    // Verify the supplied channelId belongs to this user
    const ownerId = getOwnerId(sessionUser);
    const userChannels = ownerId ? await storage.getChannelsByUserId(ownerId) : [];
    if (!userChannels.some((ch: any) => ch.id === channelId)) {
      throw new AppError(403, 'You do not have permission to use this channel');
    }
  }

  const automation = await storage.createAutomation({ ...validatedAutomation, channelId });
  res.json(automation);
});

export const updateAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sessionUser = (req as any).session?.user;
  await assertAutomationOwnership(id, sessionUser);
  const automation = await storage.updateAutomation(id, req.body);
  if (!automation) throw new AppError(404, 'Automation not found');
  res.json(automation);
});

export const deleteAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sessionUser = (req as any).session?.user;
  await assertAutomationOwnership(id, sessionUser);
  const success = await storage.deleteAutomation(id);
  if (!success) throw new AppError(404, 'Automation not found');
  res.status(204).send();
});

export const toggleAutomation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sessionUser = (req as any).session?.user;
  await assertAutomationOwnership(id, sessionUser);
  const automation = await storage.getAutomation(id);
  if (!automation) throw new AppError(404, 'Automation not found');
  const updated = await storage.updateAutomation(id, {
    status: automation.status === 'active' ? 'inactive' : 'active'
  });
  res.json(updated);
});