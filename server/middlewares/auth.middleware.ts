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
import { botfizzLogger, HTTP_STATUS } from "@botfizz/core";
import { Permission } from "@shared/schema";
import { storage } from '../storage';

// Extend Express Request type to include session
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName?: string;
        role: string;
        permissions: Permission[];
        avatar?: string;
        createdBy?: string | null;
      };
    }
  }
}

// Authentication middleware
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).session?.user;

  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  req.user = user;
  next();
};

// Role-based authorization middleware
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Permission-based authorization middleware
// export const requirePermission = (...permissions: Permission[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     const user = req.user;

//     if (!user) {
//       return res.status(401).json({ error: "Authentication required" });
//     }

//     // Admins have all permissions
//     if (user.role === "admin") {
//       return next();
//     }

//     const hasPermission = permissions.some(permission => 
//       user.permissions.includes(permission)
//     );

//     if (!hasPermission) {
//       return res.status(403).json({ error: "Insufficient permissions" });
//     }

//     next();
//   };
// };

export const requirePermission = (...permissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Only superadmin and admin bypass permission checks; all other roles must have explicit permission
    if (user.role === "superadmin" || user.role === "admin") {
      return next();
    }

    try {
      const getUserPermissions = await storage.getPermissions(user.id);

      const userPermissions = (getUserPermissions ?? []).reduce(
        (acc, perm) => {
          acc[perm] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );

      const hasPermission = permissions.some(
        (perm) => userPermissions[perm]
      );

      if (!hasPermission) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Error checking permissions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};






// Optional auth middleware (doesn't require auth but adds user if available)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).session?.user;
  if (user) {
    req.user = user;
  }
  next();
};