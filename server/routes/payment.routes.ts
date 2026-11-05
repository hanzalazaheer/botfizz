/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
  getAllProviders,
  getActiveProviders,
  getProviderById,
  getProviderByKey,
  createProvider,
  updateProvider,
  toggleProviderStatus,
  deleteProvider,
  getCurrencyGatewayMap,
} from "../controllers/payment.providers.controller";

// Transactions Controllers
import {
  getAllTransactions,
  getTransactionById,
  getTransactionsByUserId,
  createTransaction,
  updateTransactionStatus,
  completeTransaction,
  refundTransaction,
  initiatePayment,
  verifyRazorpayPayment,
  verifyStripePayment,
  verifyPayPalPayment,
  verifyPaystackPayment,
  verifyMercadoPagoPayment,
  getPaymentStatus,
  getTransactionStats,
  exportTransactions,
} from "../controllers/transactions.controller";

// Subscriptions Controllers
import {
  getAllSubscriptions,
  getSubscriptionById,
  getSubscriptionsByUserId,
  getActiveSubscriptionByUserId,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  renewSubscription,
  toggleAutoRenew,
  checkExpiredSubscriptions,
  changePlan,
} from "../controllers/subscriptions.controller";
import type { Express } from "express";

const SA = requireRole("superadmin");

export function registerPaymentsRoutes(app: Express) {
  // ==================== PAYMENT PROVIDERS ROUTES ====================
  // Read-only provider listing is public (needed for payment UI before login)
  app.get("/api/payment-providers/active", getActiveProviders);
  app.get("/api/payment-providers/currency-map", getCurrencyGatewayMap);

  // Provider management is superadmin-only
  app.get("/api/payment-providers", requireAuth, SA, getAllProviders);
  app.get("/api/payment-providers/key/:key", requireAuth, SA, getProviderByKey);
  app.get("/api/payment-providers/:id", requireAuth, SA, getProviderById);
  app.post("/api/payment-providers", requireAuth, SA, createProvider);
  app.put("/api/payment-providers/:id", requireAuth, SA, updateProvider);
  app.patch("/api/payment-providers/:id/toggle-status", requireAuth, SA, toggleProviderStatus);
  app.delete("/api/payment-providers/:id", requireAuth, SA, deleteProvider);

  // ==================== TRANSACTIONS ROUTES ====================
  // Admin-only views
  app.get("/api/transactions", requireAuth, SA, getAllTransactions);
  app.get("/api/transactions/stats", requireAuth, SA, getTransactionStats);
  app.get("/api/transactions/export", requireAuth, SA, exportTransactions);

  // Per-user — controller enforces ownership
  app.get("/api/transactions/user/:userId", requireAuth, getTransactionsByUserId);
  app.get("/api/transactions/:id", requireAuth, getTransactionById);

  // Payment initiation and verification — any authenticated user
  app.post("/api/transactions", requireAuth, createTransaction);
  app.post("/api/payment/initiate", requireAuth, initiatePayment);
  app.post("/api/payment/verify/razorpay", requireAuth, verifyRazorpayPayment);
  app.post("/api/payment/verify/stripe", requireAuth, verifyStripePayment);
  app.post("/api/payment/verify/paypal", requireAuth, verifyPayPalPayment);
  app.post("/api/payment/verify/paystack", requireAuth, verifyPaystackPayment);
  app.post("/api/payment/verify/mercadopago", requireAuth, verifyMercadoPagoPayment);
  app.get("/api/payment/status/:transactionId", requireAuth, getPaymentStatus);

  // Admin-only mutation
  app.patch("/api/transactions/:id/status", requireAuth, SA, updateTransactionStatus);
  app.post("/api/transactions/:id/complete", requireAuth, SA, completeTransaction);
  app.post("/api/transactions/:id/refund", requireAuth, SA, refundTransaction);

  // ==================== SUBSCRIPTIONS ROUTES ====================
  // Admin views
  app.get("/api/subscriptions", requireAuth, SA, getAllSubscriptions);

  // Per-user — controller enforces ownership
  app.get("/api/subscriptions/user/:userId", requireAuth, getSubscriptionsByUserId);
  app.get("/api/subscriptions/user/:userId/active", requireAuth, getActiveSubscriptionByUserId);
  app.get("/api/subscriptions/:id", requireAuth, getSubscriptionById);

  // Subscription management — superadmin only
  app.post("/api/subscriptions", requireAuth, SA, createSubscription);
  app.put("/api/subscriptions/:id", requireAuth, SA, updateSubscription);
  app.patch("/api/subscriptions/:id/cancel", requireAuth, SA, cancelSubscription);
  app.post("/api/subscriptions/:id/renew", requireAuth, SA, renewSubscription);
  app.patch("/api/subscriptions/:id/auto-renew", requireAuth, SA, toggleAutoRenew);
  app.post("/api/subscriptions/change-plan", requireAuth, SA, changePlan);
  app.post("/api/subscriptions/check-expired", requireAuth, SA, checkExpiredSubscriptions);
}
