/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { Request, Response, Router } from "express";
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import { db } from "../db";
import { users, userActivityLogs } from "@shared/schema";
import { eq, and, sql, or } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { resolveUserPermissions } from "server/utils/role-permissions";
import country from "../config/country.json"
import {sendOTPEmail} from "../services/email.service"
import { otpVerifications } from "@shared/schema";


const router = Router();

// ============================================================
// BRUTE FORCE PROTECTION — In-memory login attempt tracker
// ============================================================
// In production with multiple instances, replace with Redis-backed storage.
// NOTE: Consider adding reCAPTCHA/hCaptcha after 5 failed attempts for
// additional bot protection.
interface LoginAttemptRecord {
  failedCount: number;
  firstFailedAt: number;
  lockedUntil: number | null;
}
const loginAttempts = new Map<string, LoginAttemptRecord>();

const LOGIN_MAX_FAILED = 10;       // Lock after this many failures
const LOGIN_WINDOW_MS = 15 * 60 * 1000;  // 15-minute sliding window
const LOGIN_LOCKOUT_MS = 30 * 60 * 1000; // 30-minute lockout

function getLoginAttemptRecord(key: string): LoginAttemptRecord {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return { failedCount: 0, firstFailedAt: now, lockedUntil: null };
  if (now - record.firstFailedAt > LOGIN_WINDOW_MS && !record.lockedUntil) {
    return { failedCount: 0, firstFailedAt: now, lockedUntil: null };
  }
  return record;
}

function recordFailedLogin(key: string): LoginAttemptRecord {
  const now = Date.now();
  const record = getLoginAttemptRecord(key);
  record.failedCount += 1;
  if (record.failedCount >= LOGIN_MAX_FAILED) {
    record.lockedUntil = now + LOGIN_LOCKOUT_MS;
    botfizzLogger.warn(`[Security] Account locked due to ${LOGIN_MAX_FAILED} failed login attempts: ${key}`);
  }
  loginAttempts.set(key, record);
  return record;
}

function clearLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}

function isAccountLocked(key: string): boolean {
  const record = loginAttempts.get(key);
  if (!record?.lockedUntil) return false;
  if (Date.now() > record.lockedUntil) {
    loginAttempts.delete(key);
    return false;
  }
  return true;
}

// ============================================================
// OTP VERIFICATION ATTEMPT TRACKING — brute-force protection
// ============================================================
interface OtpAttemptRecord {
  attempts: number;
  firstAttemptAt: number;
}
const otpAttempts = new Map<string, OtpAttemptRecord>();

const OTP_MAX_ATTEMPTS = 10;
const OTP_ATTEMPT_WINDOW_MS = 30 * 60 * 1000; // 30 minutes

function recordOtpAttempt(key: string): number {
  const now = Date.now();
  const record = otpAttempts.get(key);
  if (!record || now - record.firstAttemptAt > OTP_ATTEMPT_WINDOW_MS) {
    otpAttempts.set(key, { attempts: 1, firstAttemptAt: now });
    return 1;
  }
  record.attempts += 1;
  otpAttempts.set(key, record);
  return record.attempts;
}

function clearOtpAttempts(key: string): void {
  otpAttempts.delete(key);
}

// ============================================================
// OTP REQUEST RATE LIMITING — per email, 5 per hour
// ============================================================
interface OtpRequestRecord {
  timestamps: number[];
}
const otpRequestTracker = new Map<string, OtpRequestRecord>();

const OTP_REQUEST_MAX = 5;
const OTP_REQUEST_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isOtpRequestRateLimited(email: string): boolean {
  const now = Date.now();
  const record = otpRequestTracker.get(email);
  if (!record) return false;
  const recent = record.timestamps.filter(t => now - t < OTP_REQUEST_WINDOW_MS);
  record.timestamps = recent;
  otpRequestTracker.set(email, record);
  return recent.length >= OTP_REQUEST_MAX;
}

function recordOtpRequest(email: string): void {
  const now = Date.now();
  const record = otpRequestTracker.get(email) || { timestamps: [] };
  record.timestamps.push(now);
  otpRequestTracker.set(email, record);
}


// Validation schemas
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Login endpoint — with brute-force protection
router.post("/login", validateRequest(loginSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";

    // Check brute-force lockout (by username)
    if (isAccountLocked(username.toLowerCase())) {
      botfizzLogger.warn(`[Security] Blocked login attempt for locked account: ${username} from IP: ${clientIp}`);
      return res.status(429).json({
        error: "Account temporarily locked due to too many failed attempts. Please try again later.",
      });
    }

    // Find user by username or email
    const results = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, username)));

    const user = results[0];

    if (!user) {
      // Record failed attempt — generic error prevents username enumeration
      recordFailedLogin(username.toLowerCase());
      botfizzLogger.warn(`[Security] Failed login (user not found): username="${username}" IP=${clientIp}`);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Check if user is active
    if ((user.status || "").trim().toLowerCase() !== "active") {
      return res.status(403).json({ error: "Account is inactive. Please contact administrator." });
    }

    // Check if email is verified
    if (user.isEmailVerified === false) {
      return res.status(403).json({ error: "Email not verified. Please verify your email first." });
    }

    // Ensure password field exists
    if (!user.password) {
      console.error("User has no password in DB:", user.id);
      return res.status(500).json({ error: "User record is invalid. Contact support." });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const record = recordFailedLogin(username.toLowerCase());
      botfizzLogger.warn(`[Security] Failed login (wrong password): username="${username}" IP=${clientIp} attempts=${record.failedCount}/${LOGIN_MAX_FAILED}`);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Successful login — clear failed attempts
    clearLoginAttempts(username.toLowerCase());

    // Update last login
    await db
      .update(users)
      .set({
        lastLogin: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    // Log activity
    try {
      await db.insert(userActivityLogs).values({
        userId: user.id,
        action: "login",
        entityType: "user",
        entityId: user.id,
        details: JSON.stringify({
          ipAddress: clientIp,
          userAgent: req.get("user-agent"),
        }),
        ipAddress: clientIp,
        userAgent: req.get("user-agent"),
      });
    } catch (logError) {
      console.error("Failed to log login activity:", logError);
    }

    // Store user in session
    if (!(req as any).session) {
      console.error("Session not initialized");
      return res.status(500).json({ error: "Session not initialized" });
    }

    (req as any).session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions: resolveUserPermissions(user.role, user.permissions as any),
      avatar: user.avatar,
      createdBy: user.createdBy || "",
    };

    // Remove password before sending back
    const { password: _, ...userData } = user;

    res.json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    botfizzLogger.error("Login error:", (error as Error).message);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout endpoint
router.post("/logout", (req, res) => {
  const userId = (req as any).session?.user?.id;

  if (userId) {
    db.insert(userActivityLogs)
      .values({
        userId,
        action: "logout",
        entityType: "user",
        entityId: userId,
        details: {},
      })
      .catch(console.error);
  }

  (req as any).session.destroy((err: any) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ error: "Logout failed" });
    }

    res.clearCookie("_app_session");
    res.json({ message: "Logout successful" });
  });
});

// Get current user
router.get("/me", async (req, res) => {
  const user = (req as any).session?.user;
  if (!user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id));

  if (!currentUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // Remove password from response
  const { password, ...userData } = currentUser;
  res.json(userData);
});

// Check if authenticated (for frontend)
router.get("/check", (req, res) => {
  const user = (req as any).session?.user;
  res.json({ authenticated: !!user, user });
});


router.get("/country-data", (req, res) => {
  res.json(country);
});


// ============================================================
// FORGOT PASSWORD — with rate limiting & anti-enumeration
// ============================================================

router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Rate limiting: max 5 OTP requests per hour per email
    if (isOtpRequestRateLimited(email.toLowerCase())) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (!existingUser.length) {
      // SECURITY: Return same success message to prevent email enumeration
      return res.json({
        success: true,
        message: "If an account with that email exists, a verification code has been sent.",
      });
    }

    const userId = existingUser[0].id;
    const userName = existingUser[0].firstName;

    // Additional DB-level rate check: max 3 OTP per 5 min (burst protection)
    const recentOTPs = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.userId, userId),
          sql`${otpVerifications.createdAt} > NOW() - INTERVAL '5 minutes'`
        )
      );

    if (recentOTPs.length >= 3) {
      return res.status(429).json({
        error: "Too many requests. Try again in 5 minutes.",
      });
    }

    // Generate 6-digit OTP using cryptographically secure random number
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in DB
    await db.insert(otpVerifications).values({
      userId,
      otpCode,
      expiresAt,
      isUsed: false,
    });

    // Record the request for rate limiting
    recordOtpRequest(email.toLowerCase());

    // Send OTP via email
    try {
      await sendOTPEmail(email, otpCode, userName);
    } catch (emailError) {
      botfizzLogger.error("Failed to send OTP email");
    }

    res.json({
      success: true,
      message: "If an account with that email exists, a verification code has been sent.",
    });
  } catch (error: any) {
    botfizzLogger.error("Forgot password error:", (error as Error).message);
    res.status(500).json({ error: "Failed to process request" });
  }
});


// ============================================================
// RESET PASSWORD — with OTP brute-force protection
// ============================================================

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otpCode, newPassword } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";

    if (!email || !otpCode || !newPassword) {
      return res.status(400).json({ error: "Email, OTP code, and new password are required" });
    }

    // Rate limit OTP verification attempts per IP + email
    const attemptKey = `reset:${clientIp}:${email.toLowerCase()}`;
    const attempts = recordOtpAttempt(attemptKey);
    if (attempts > OTP_MAX_ATTEMPTS) {
      botfizzLogger.warn(`[Security] OTP brute force blocked: IP=${clientIp} email=${email} attempts=${attempts}`);
      // Invalidate all OTPs for this user to stop brute-force
      const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (userRecord.length) {
        await db.update(otpVerifications)
          .set({ isUsed: true })
          .where(eq(otpVerifications.userId, userRecord[0].id));
      }
      return res.status(429).json({ error: "Too many attempts. All verification codes have been invalidated. Please request a new code." });
    }

    // Find user — generic error to avoid enumeration
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser.length) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const userId = existingUser[0].id;

    // Find a valid, unexpired, unused OTP that matches the submitted code.
    const otpRecord = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.userId, userId),
          eq(otpVerifications.otpCode, otpCode.toString()),
          eq(otpVerifications.isUsed, false),
          sql`${otpVerifications.expiresAt} > timezone('UTC', now())`
        )
      )
      .limit(1);

    if (!otpRecord.length) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    // Delete OTP immediately after use (single-use enforcement)
    await db
      .delete(otpVerifications)
      .where(eq(otpVerifications.id, otpRecord[0].id));

    // Invalidate remaining OTPs for this user to prevent replay
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.userId, userId));

    // Clear OTP attempt tracking
    clearOtpAttempts(attemptKey);

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    botfizzLogger.error("Reset password error:", (error as Error).message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});


// ============================================================
// VERIFY OTP — with brute-force protection
// ============================================================

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";

    if (!email || !otpCode) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    // Rate limit OTP verification attempts per IP + email
    const attemptKey = `verify:${clientIp}:${email.toLowerCase()}`;
    const attempts = recordOtpAttempt(attemptKey);
    if (attempts > OTP_MAX_ATTEMPTS) {
      botfizzLogger.warn(`[Security] OTP verify brute force blocked: IP=${clientIp} email=${email} attempts=${attempts}`);
      const userRecord = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (userRecord.length) {
        await db.update(otpVerifications)
          .set({ isUsed: true })
          .where(eq(otpVerifications.userId, userRecord[0].id));
      }
      return res.status(429).json({ error: "Too many attempts. All verification codes have been invalidated. Please request a new code." });
    }

    // Find user — generic error prevents enumeration
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser.length) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const userId = existingUser[0].id;

    // Find valid OTP
    const otpRecord = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.userId, userId),
          eq(otpVerifications.otpCode, otpCode.toString()),
          eq(otpVerifications.isUsed, false),
          sql`${otpVerifications.expiresAt} > timezone('UTC', now())`
        )
      )
      .limit(1);

    if (!otpRecord.length) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // OTP valid => delete immediately (single-use enforcement)
    await db
      .delete(otpVerifications)
      .where(eq(otpVerifications.id, otpRecord[0].id));

    clearOtpAttempts(attemptKey);

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error: any) {
    botfizzLogger.error("OTP verification error:", (error as Error).message);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
});


// Periodic cleanup of expired OTPs
setInterval(async () => {
  try {
    await db.delete(otpVerifications).where(
      sql`${otpVerifications.expiresAt} < timezone('UTC', now())`
    );
  } catch (error) {
    console.error('[OTP Cleanup] Error:', error);
  }
}, 5 * 60 * 1000);

// Periodic cleanup of stale in-memory tracking maps (prevent memory leaks)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts) {
    if (record.lockedUntil && now > record.lockedUntil) {
      loginAttempts.delete(key);
    } else if (now - record.firstFailedAt > LOGIN_WINDOW_MS + LOGIN_LOCKOUT_MS) {
      loginAttempts.delete(key);
    }
  }
  for (const [key, record] of otpAttempts) {
    if (now - record.firstAttemptAt > OTP_ATTEMPT_WINDOW_MS) {
      otpAttempts.delete(key);
    }
  }
  for (const [key, record] of otpRequestTracker) {
    record.timestamps = record.timestamps.filter(t => now - t < OTP_REQUEST_WINDOW_MS);
    if (record.timestamps.length === 0) {
      otpRequestTracker.delete(key);
    }
  }
}, 10 * 60 * 1000);


export default router;