/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { Request, Response } from "express";
import { botfizzLogger } from "@botfizz/core";
import { db } from "../db";
import {users, channels} from "@shared/schema";
import { eq, or, like, sql, and, desc, gte, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { otpVerifications } from "@shared/schema";
import { sendOTPEmailVerify } from "../services/email.service";
import { resolveUserPermissions } from "../utils/role-permissions";


// Default permissions 
export const defaultPermissions = [
      // Contacts
      'contacts:view',
      'contacts:create',
      'contacts:edit',
      'contacts:delete',
      'contacts:export',

      // Campaigns
      'campaigns:view',
      'campaigns:create',
      'campaigns:edit',
      'campaigns:delete',

      // Templates
      'templates:view',
      'templates:create',
      'templates:edit',
      'templates:delete',

      // Analytics
      'analytics:view',

      // Team
      'team:view',
      'team:create',
      'team:edit',
      'team:delete',

      // Settings
      'settings:view',

      // Inbox
      'inbox:view',
      'inbox:send',
      'inbox:assign',

      // Automations
      'automations:view',
      'automations:create',
      'automations:edit',
      'automations:delete',
    ];


export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";
    const role = (req.query.role as string) || "admin";
    const status = (req.query.status as string) || "";
    const hasChannels = (req.query.hasChannels as string) || "";
    const dateRange = (req.query.dateRange as string) || "";
    const offset = (page - 1) * limit;

    const conditions: any[] = [
      eq(users.role, role),
      search ? or(
        like(users.username, sql`${'%' + search + '%'}`),
        like(users.email, sql`${'%' + search + '%'}`)
      ) : undefined,
      status ? eq(users.status, status) : undefined,
    ].filter(Boolean);

    if (dateRange === "week") {
      conditions.push(gte(users.createdAt, sql`NOW() - INTERVAL '7 days'`));
    } else if (dateRange === "month") {
      conditions.push(gte(users.createdAt, sql`NOW() - INTERVAL '30 days'`));
    }

    const channelCountSql = sql<number>`(
      SELECT CAST(COUNT(*) AS INTEGER) FROM channels ch
      WHERE ch.created_by = users.id
    )`.as("channelCount");

    if (hasChannels === "yes") {
      conditions.push(sql`(SELECT COUNT(*) FROM channels ch WHERE ch.created_by = users.id) > 0`);
    } else if (hasChannels === "no") {
      conditions.push(sql`(SELECT COUNT(*) FROM channels ch WHERE ch.created_by = users.id) = 0`);
    }

    let baseQuery = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        avatar: users.avatar,
        status: users.status,
        permissions: users.permissions,
        channelId: users.channelId,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        createdBy: users.createdBy,
        fcmToken: users.fcmToken,
        isEmailVerified: users.isEmailVerified,
        stripeCustomerId: users.stripeCustomerId,
        razorpayCustomerId: users.razorpayCustomerId,
        channelCount: channelCountSql,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt));

    const allUsers = await (baseQuery as any).limit(limit).offset(offset);

    const countQuery = db
      .select({ total: sql<number>`COUNT(*)` })
      .from(users)
      .where(and(...conditions));

    const totalCountResult = await countQuery;
    const total = totalCountResult[0]?.total ?? 0;

    res.status(200).json({
      success: true,
      data: allUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

export const exportAllUsers = async (req: Request, res: Response) => {
  try {
    const role = (req.query.role as string) || "admin";
    const search = (req.query.search as string) || "";
    const statusFilter = (req.query.status as string) || "";
    const hasChannels = (req.query.hasChannels as string) || "";
    const dateRange = (req.query.dateRange as string) || "";

    const conditions: any[] = [
      eq(users.role, role),
      search ? or(
        like(users.username, sql`${'%' + search + '%'}`),
        like(users.email, sql`${'%' + search + '%'}`)
      ) : undefined,
      statusFilter ? eq(users.status, statusFilter) : undefined,
    ].filter(Boolean);

    if (dateRange === "week") {
      conditions.push(gte(users.createdAt, sql`NOW() - INTERVAL '7 days'`));
    } else if (dateRange === "month") {
      conditions.push(gte(users.createdAt, sql`NOW() - INTERVAL '30 days'`));
    }

    const exportChannelCountSql = sql<number>`(
      SELECT CAST(COUNT(*) AS INTEGER) FROM channels ch
      WHERE ch.created_by = users.id
    )`.as("channelCount");

    const exportChannelNamesSql = sql<string>`(
      SELECT COALESCE(STRING_AGG(COALESCE(ch.name, ch.phone_number, 'Unknown'), ', '), '')
      FROM channels ch
      WHERE ch.created_by = users.id
    )`.as("channelNames");

    if (hasChannels === "yes") {
      conditions.push(sql`(SELECT COUNT(*) FROM channels ch WHERE ch.created_by = users.id) > 0`);
    } else if (hasChannels === "no") {
      conditions.push(sql`(SELECT COUNT(*) FROM channels ch WHERE ch.created_by = users.id) = 0`);
    }

    let query = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        status: users.status,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        channelCount: exportChannelCountSql,
        channelNames: exportChannelNamesSql,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt));

    const allUsers = await query;

    res.status(200).json({ success: true, data: allUsers });
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ success: false, message: "Error exporting users" });
  }
};

export const bulkUpdateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userIds, status } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "userIds array is required" });
    }

    const allowed = ["active", "inactive", "banned"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(", ")}` });
    }

    const updated = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(inArray(users.id, userIds))
      .returning({ id: users.id, status: users.status });

    res.status(200).json({
      success: true,
      message: `${updated.length} user(s) updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error("Error bulk updating user status:", error);
    res.status(500).json({ success: false, message: "Error updating users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const { password: _pw, ...safeUser } = user;
    res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};




export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, email, firstName, lastName, avatar } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and email are required.",
      });
    }

    // 1️⃣ Check if email exists
    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUserByEmail.length > 0) {
      const user = existingUserByEmail[0];

      if (!user.isEmailVerified) {
        // Email unverified → allow updating username, password, etc.

        // Check if new username is taken by another account
        const usernameTaken = await db
          .select()
          .from(users)
          .where(and(
            eq(users.username, username),
            sql`${users.id} != ${user.id}` // exclude current user
          ));

        if (usernameTaken.length > 0) {
          return res.status(409).json({
            success: false,
            message: "Username already exists.",
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update existing unverified user
        await db
          .update(users)
          .set({
            username,
            password: hashedPassword,
            firstName: firstName || user.firstName,
            lastName: lastName || user.lastName,
            avatar: avatar || user.avatar,
            // SECURITY: Never allow role escalation via public signup body.
          })
          .where(eq(users.id, user.id));

        // Remove old OTPs
        await db.delete(otpVerifications).where(eq(otpVerifications.userId, user.id));

        // Generate new OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        botfizzLogger.info(`Resending OTP for user (email omitted for security)`);

        await db.insert(otpVerifications).values({
          userId: user.id,
          otpCode,
          expiresAt,
          isUsed: false,
        });

        let emailSentResend = false;
        try {
          await sendOTPEmailVerify(email, otpCode, firstName || user.firstName);
          emailSentResend = true;
        } catch (emailErr) {
          console.error("[Signup] Failed to resend OTP email:", emailErr);
        }

        return res.status(200).json({
          success: true,
          emailSent: emailSentResend,
          message: emailSentResend
            ? "Email already exists but not verified. OTP resent and account updated."
            : "Account updated. Verification email could not be sent — please check SMTP settings or try again.",
        });
      } else {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    // 2️⃣ Check username for new accounts
    const existingUserByUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existingUserByUsername.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists.",
      });
    }

    // 3️⃣ Create new user
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role: "admin",
        avatar,
        permissions: defaultPermissions,
        isEmailVerified: false,
        status: "inactive",
      })
      .returning();

    const user = newUser[0];


    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    botfizzLogger.info(`Generated OTP for new user registration`);

    await db.insert(otpVerifications).values({
      userId: user.id,
      otpCode,
      expiresAt,
      isUsed: false,
    });

    let emailSent = false;
    try {
      await sendOTPEmailVerify(email, otpCode, firstName);
      emailSent = true;
    } catch (emailErr) {
      console.error("[Signup] Failed to send OTP email:", emailErr);
    }

    return res.status(201).json({
      success: true,
      emailSent,
      message: emailSent
        ? "User created. Verification OTP sent to email."
        : "User created. Verification email could not be sent — please check SMTP settings or try again.",
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user. Please try again.",
    });
  }
};




export const verifyEmailOTP = async (req: Request, res: Response) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    // User fetch
    const user = await db.select().from(users).where(eq(users.email, email));
    if (!user.length) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const userData = user[0];

    // OTP fetch
    const otpRecord = await db
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.userId, userData.id))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    if (!otpRecord.length) {
      return res.status(400).json({
        success: false,
        message: "No OTP found.",
      });
    }

    const otp = otpRecord[0];

    // Check OTP validity
    if (otp.isUsed) {
      return res.status(400).json({ success: false, message: "OTP already used." });
    }

    if (otp.otpCode !== otpCode) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    if (new Date() > otp.expiresAt) {
      return res.status(400).json({ success: false, message: "OTP expired." });
    }

    // Mark OTP as used
    await db
      .update(otpVerifications)
      .set({ isUsed: true })
      .where(eq(otpVerifications.id, otp.id));

    // Mark user email verified and activate account
    const [activatedUser] = await db
      .update(users)
      .set({ isEmailVerified: true, status: "active" })
      .where(eq(users.id, userData.id))
      .returning();

    // Auto-login: create session so user goes straight to dashboard
    (req as any).session.user = {
      id: activatedUser.id,
      username: activatedUser.username,
      email: activatedUser.email,
      firstName: activatedUser.firstName,
      lastName: activatedUser.lastName,
      role: activatedUser.role,
      permissions: resolveUserPermissions(activatedUser.role, activatedUser.permissions as any),
      avatar: activatedUser.avatar,
      createdBy: activatedUser.createdBy || "",
    };

    const { password: _pw, ...safeUser } = activatedUser;

    return res.json({
      success: true,
      message: "Email verified successfully.",
      user: safeUser,
    });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};



export const createUserOld = async (req: Request, res: Response) => {
  try {
    const { username, password, email, firstName, lastName, avatar, permissions } = req.body;

    // 🧱 Validate required fields
    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and email are required.",
      });
    }

    // 🔍 Check if username already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists. Please choose another one.",
      });
    }

    // 🔒 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 📝 Insert new user
    const newUser = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role: "admin",
        avatar,
        permissions: defaultPermissions,
      })
      .returning();

    return res.status(201).json({
      success: true,
      data: newUser[0],
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    const { password: _pw, ...safeUser } = updated;
    res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ success: false, message: "Error updating user" });
  }
};


export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const allowed = ["active", "inactive"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: active, inactive",
      });
    }

    // Update status only
    const updated = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning({ id: users.id, status: users.status });

    // No user found
    if (!updated.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updated[0],
    });

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating status",
    });
  }
};


export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.delete(users).where(eq(users.id, id));
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};





// Add user for super admin

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (!existingUser.length) {
      return res.status(404).json({ success: false, message: "No account found with this email." });
    }

    const user = existingUser[0];
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified." });
    }

    // Rate limit: max 1 resend per 60 seconds
    const recentOTP = await db
      .select()
      .from(otpVerifications)
      .where(and(
        eq(otpVerifications.userId, user.id),
        sql`${otpVerifications.createdAt} > NOW() - INTERVAL '60 seconds'`
      ))
      .limit(1);

    if (recentOTP.length > 0) {
      return res.status(429).json({ success: false, message: "Please wait before requesting another code." });
    }

    // Clear old OTPs and generate new one
    await db.delete(otpVerifications).where(eq(otpVerifications.userId, user.id));

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(otpVerifications).values({ userId: user.id, otpCode, expiresAt, isUsed: false });

    let emailSent = false;
    try {
      await sendOTPEmailVerify(email, otpCode, user.firstName || undefined);
      emailSent = true;
    } catch (emailErr) {
      console.error("[ResendOTP] Failed to send email:", emailErr);
    }

    return res.status(200).json({
      success: true,
      emailSent,
      message: emailSent ? "Verification code resent to your email." : "Could not send email. Please check SMTP settings.",
    });

  } catch (error) {
    console.error("Error resending OTP:", error);
    return res.status(500).json({ success: false, message: "Failed to resend code." });
  }
};

export const createUserSuperadmin = async (req: Request, res: Response) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        success: false,
        message: "Username, password, and email are required.",
      });
    }

    // Check existing user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role: "admin",
        permissions: defaultPermissions,
        isEmailVerified: true,
      })
      .returning();

    const user = newUser[0];


    return res.status(201).json({
      success: true,
      message: "User created.",
      data: { id: user.id, email },
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
};
