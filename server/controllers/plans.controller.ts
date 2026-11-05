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
import { eq } from 'drizzle-orm';
import { plans } from '@shared/schema';
import {
  syncPlanToAllGateways,
  syncPlanToStripe,
  syncPlanToRazorpay,
} from '../services/payment-gateway.service';
import { cacheGet, cacheInvalidate, CACHE_KEYS, CACHE_TTL } from '../services/cache';

export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const allPlans = await cacheGet(CACHE_KEYS.subscriptionPlans(), CACHE_TTL.subscriptionPlans, async () => {
      return db.select().from(plans);
    });
    res.status(200).json({ success: true, data: allPlans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching plans' });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = await db.select().from(plans).where(eq(plans.id, id));

    if (plan.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    res.status(200).json({ success: true, data: plan[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching plan' });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      icon,
      popular,
      badge,
      color,
      buttonColor,
      monthlyPrice,
      annualPrice,
      permissions,
      features
    } = req.body;

    const newPlan = await db.insert(plans).values({
      name,
      description,
      icon,
      popular: popular || false,
      badge,
      color,
      buttonColor,
      monthlyPrice,
      annualPrice,
      permissions,
      features
    }).returning();

    await cacheInvalidate(CACHE_KEYS.subscriptionPlans());

    res.status(201).json({ success: true, data: newPlan[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating plan' });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPlan = await db
      .update(plans)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(plans.id, id))
      .returning();

    if (updatedPlan.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await cacheInvalidate(CACHE_KEYS.subscriptionPlans());
    await cacheInvalidate(CACHE_KEYS.planById(id));

    res.status(200).json({ success: true, data: updatedPlan[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating plan' });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedPlan = await db
      .delete(plans)
      .where(eq(plans.id, id))
      .returning();

    if (deletedPlan.length === 0) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    await cacheInvalidate(CACHE_KEYS.subscriptionPlans());
    await cacheInvalidate(CACHE_KEYS.planById(id));

    res.status(200).json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting plan' });
  }
};

export const syncPlanToGateway = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { gateway } = req.body;

    const plan = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
    if (!plan.length) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    let result;
    if (gateway === 'stripe') {
      result = await syncPlanToStripe(id);
    } else if (gateway === 'razorpay') {
      result = await syncPlanToRazorpay(id);
    } else {
      result = await syncPlanToAllGateways(id);
    }

    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error syncing plan to gateway:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing plan to gateway",
    });
  }
};

export const syncAllPlansToGateways = async (_req: Request, res: Response) => {
  try {
    const allPlans = await db.select().from(plans);
    const results: { planId: string; planName: string; result: any }[] = [];
    const errors: { planId: string; planName: string; error: string }[] = [];

    for (const plan of allPlans) {
      try {
        const result = await syncPlanToAllGateways(plan.id);
        results.push({ planId: plan.id, planName: plan.name, result });
      } catch (err: any) {
        errors.push({ planId: plan.id, planName: plan.name, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        synced: results.length,
        failed: errors.length,
        results,
        errors,
      },
    });
  } catch (error: any) {
    console.error("Error syncing plans:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing plans",
    });
  }
};
