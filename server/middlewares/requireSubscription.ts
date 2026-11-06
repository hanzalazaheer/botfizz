/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { Request, Response, NextFunction } from "express";

/**
 * Botfizz is free: there are no plans, subscriptions or usage limits.
 * The guard stays in place as a no-op so route definitions don't change.
 */
export const requireSubscription =
  (_resource: "channel" | "contacts" | "automation" | "campaign") =>
  (_req: Request, _res: Response, next: NextFunction) =>
    next();
