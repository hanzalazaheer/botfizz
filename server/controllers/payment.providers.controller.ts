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
import { paymentProviders } from '@shared/schema';

export const getCurrencyGatewayMap = async (req: Request, res: Response) => {
  try {
    const providers = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.isActive, true));

    const currencyMap: Record<string, { providerKey: string; providerId: string; providerName: string }[]> = {};

    for (const provider of providers) {
      const currencies = Array.isArray(provider.supportedCurrencies) && provider.supportedCurrencies.length > 0
        ? provider.supportedCurrencies
        : provider.providerKey === 'razorpay' ? ['INR'] : ['USD'];

      for (const cur of currencies) {
        const code = cur.toUpperCase();
        if (!currencyMap[code]) currencyMap[code] = [];
        currencyMap[code].push({
          providerKey: provider.providerKey,
          providerId: provider.id,
          providerName: provider.name,
        });
      }
    }

    const availableCurrencies = Object.keys(currencyMap).sort();

    res.status(200).json({
      success: true,
      data: {
        currencyMap,
        availableCurrencies,
        providers: providers.map(p => ({
          id: p.id,
          name: p.name,
          providerKey: p.providerKey,
          supportedCurrencies: Array.isArray(p.supportedCurrencies) && p.supportedCurrencies.length > 0
            ? p.supportedCurrencies
            : p.providerKey === 'razorpay' ? ['INR'] : ['USD'],
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching currency gateway map' });
  }
};

// Get all payment providers
export const getAllProviders = async (req: Request, res: Response) => {
  try {
    const providers = await db.select().from(paymentProviders);
    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching providers' });
  }
};

// Get active payment providers only
export const getActiveProviders = async (req: Request, res: Response) => {
  try {
    const providers = await db
      .select({
        id: paymentProviders.id,
        name: paymentProviders.name,
        providerKey: paymentProviders.providerKey,
        logo: paymentProviders.logo,
      })
      .from(paymentProviders)
      .where(eq(paymentProviders.isActive, true));

    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active providers",
    });
  }
};

// Get single payment provider by ID
export const getProviderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const provider = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.id, id));
    
    if (provider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    res.status(200).json({ success: true, data: provider[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching provider' });
  }
};

// Get provider by key (e.g., "razorpay", "stripe")
export const getProviderByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const provider = await db
      .select()
      .from(paymentProviders)
      .where(eq(paymentProviders.providerKey, key));
    
    if (provider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    
    res.status(200).json({ success: true, data: provider[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching provider' });
  }
};

// Create new payment provider
export const createProvider = async (req: Request, res: Response) => {
  try {
    const {
      name,
      providerKey,
      description,
      logo,
      isActive,
      config,
      supportedCurrencies,
      supportedMethods
    } = req.body;

    const newProvider = await db
      .insert(paymentProviders)
      .values({
        name,
        providerKey,
        description,
        logo,
        isActive: isActive ?? true,
        config,
        supportedCurrencies,
        supportedMethods
      })
      .returning();

    res.status(201).json({ success: true, data: newProvider[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating provider' });
  }
};

// Update payment provider
export const updateProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProvider = await db
      .update(paymentProviders)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(paymentProviders.id, id))
      .returning();

    if (updatedProvider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const { resetGatewayInstances } = await import("../services/payment-gateway.service");
    resetGatewayInstances();

    res.status(200).json({ success: true, data: updatedProvider[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating provider' });
  }
};

// Toggle provider active status
export const toggleProviderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updatedProvider = await db
      .update(paymentProviders)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(paymentProviders.id, id))
      .returning();

    if (updatedProvider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    const { resetGatewayInstances } = await import("../services/payment-gateway.service");
    resetGatewayInstances();

    res.status(200).json({ 
      success: true, 
      message: `Provider ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedProvider[0] 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling provider status' });
  }
};

// Delete payment provider
export const deleteProvider = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedProvider = await db
      .delete(paymentProviders)
      .where(eq(paymentProviders.id, id))
      .returning();

    if (deletedProvider.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }

    res.status(200).json({ success: true, message: 'Provider deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting provider' });
  }
};