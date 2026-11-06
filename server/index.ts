/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

process.on("uncaughtException", (err) => {
  console.error("[Process] Uncaught exception — server will keep running:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Process] Unhandled promise rejection — server will keep running:", reason);
});

import "./sandbox";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes/index";
import { setupVite, serveStatic, log } from "./vite";
import { MessageStatusUpdater } from "./services/message-status-updater";
import { MessageQueueService } from "./services/message-queue";
import "dotenv/config";
import { initializeUploadsDirectory } from "./middlewares/upload.middleware";
import cors from "cors";
import { rateLimitMiddleware } from "./middlewares/rate-limit.middleware";
import path from "path";
import helmet from "helmet";
import { createServer } from "http";
import { storage } from "./storage";
import { Server as SocketIOServer, Socket } from "socket.io";
import { fetchConversationList } from "./controllers/conversations.controller";
import { startScheduledCampaignCron } from "./cron/scheduledCampaigns.cron";
import { startCampaignExecution } from "./controllers/campaigns.controller";
import { subscribeChannelToWebhook } from "./controllers/channels.controller";
import { db } from "./db";
import { campaigns as campaignsTable, messageQueue } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { executionService } from "./services/automation-execution-service";
import { botfizzLogger as botfizzLogger, BOTFIZZ_VERSION, BOTFIZZ_PRODUCT_NAME } from "@botfizz/core";
import { createAdapter } from "@socket.io/redis-adapter";
import { runStartupMigration } from "./startup-migration";

function validateEnvironment(): void {
  const required = ['DATABASE_URL', 'SESSION_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (process.env.NODE_ENV === 'production') {
    const productionRequired = ['SESSION_SECRET', 'APP_URL', 'CORS_ORIGINS'];
    const missingProd = productionRequired.filter(key => !process.env[key]);
    if (missingProd.length > 0) {
      throw new Error(`Missing required production environment variables: ${missingProd.join(', ')}`);
    }
    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      throw new Error('SESSION_SECRET must be at least 32 characters in production');
    }
  }
  console.log('[Startup] Environment validation passed');
}

validateEnvironment();

const app = express();
const httpServer = createServer(app);

// ============================================
// INITIALIZE SOCKET.IO
// ============================================

// Allowed origins for CORS — set CORS_ORIGINS env var as a comma-separated list in production
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : process.env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://localhost:3000']
    : [];

const corsOriginHandler = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
) => {
  if (!origin || allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
};

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOriginHandler,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

if (process.env.REDIS_URL) {
  (async () => {
    try {
      const Redis = (await import("ioredis")).default;
      const redisUrl = process.env.REDIS_URL!;

      const redisOpts = {
        maxRetriesPerRequest: 3,
        enableOfflineQueue: false,
        lazyConnect: true,
        retryStrategy() { return null; },
      };

      const pubClient = new Redis(redisUrl, redisOpts);
      const subClient = new Redis(redisUrl, redisOpts);

      pubClient.on("error", () => { });
      subClient.on("error", () => { });

      const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));

      await Promise.all([
        Promise.race([pubClient.connect(), timeout(5000)]),
        Promise.race([subClient.connect(), timeout(5000)]),
      ]);

      io.adapter(createAdapter(pubClient, subClient));
      console.log("[Socket.IO] Redis adapter attached for multi-instance support");
    } catch {
      console.warn("[Socket.IO] Redis not available — using in-memory adapter (this is fine for single-instance)");
    }
  })();
}

(global as any).io = io;

// Store connected users
const connectedUsers = new Map();
const conversationRooms = new Map();

// Verify session for agent/admin Socket.IO connections before the connection handler runs.
// Widget visitors may connect without a server session and are identified by role=visitor.
io.use((socket: Socket, next: (err?: Error) => void) => {
  const req = socket.request as any;
  const sessionUser = req.session?.user;
  const queryRole = (socket.handshake.query.role as string) || '';

  if (sessionUser) {
    (socket as any).verifiedUser = sessionUser;
    return next();
  }

  // Permit unauthenticated widget visitor connections
  if (!queryRole || queryRole === 'visitor') {
    return next();
  }

  // Block any agent/admin connection that has no valid server session
  return next(new Error('Authentication required'));
});

// Socket.io connection handler
io.on("connection", (socket) => {
  const { siteId } = socket.handshake.query;

  // Use server-verified session identity; fall back to query params for unauthenticated visitors only
  const verifiedUser = (socket as any).verifiedUser as { id: string; role: string } | undefined;
  const userId = verifiedUser?.id ?? (socket.handshake.query.userId as string | undefined);
  const role = verifiedUser?.role ?? (socket.handshake.query.role as string | undefined);

  // Store user info
  const user = {
    socketId: socket.id,
    userId: userId ?? '',
    role: role ?? 'visitor',
    siteId: siteId as string,
  };

  connectedUsers.set(socket.id, user);

  if (userId) {
    socket.join(`user:${userId}`);
  }

  // Join site room for broadcasts
  if (siteId) {
    socket.join(`site:${siteId}`);
  }


  socket.on("test_event", (data) => {
    console.log("🔥 TEST EVENT RECEIVED:", data);

    socket.emit("test_response", { msg: "Server se response aaya!" });
  });
  socket.on("join-room", ({ room }) => {
    console.log("📥 Socket joined room:", room);
    socket.join(room);
  });

  socket.on("leave-room", ({ room }) => {
    socket.leave(room);
    console.log("📤 Left:", room);
  });



  // ============================================
  // GET CONVERSATIONS LIST (AGENT SIDE)
  // ============================================
  socket.on("get_conversations", async ({ channelId }) => {
    try {
      console.log("🔥 get_conversations called for channel:", channelId);

      const list = await fetchConversationList(channelId);

      console.log("🔥 conversations_list sending:", list?.length || 0);

      socket.emit("conversations_list", list);

    } catch (err) {
      console.error("Error fetching conversations via socket:", err);
    }
  });





  // ==========================================
  // AGENT EVENTS
  // ==========================================

  // Agent joins a conversation

  socket.on(
    "agent_join_conversation",
    async ({ conversationId, agentId, agentName }) => {
      console.log(`Agent ${agentName} joining conversation ${conversationId}`);

      // Join BOTH room formats
      socket.join(`conversation:${conversationId}`);
      socket.join(`conversation_${conversationId}`);  // ADD THIS LINE

      const user = connectedUsers.get(socket.id);
      if (user) {
        user.conversationId = conversationId;
        user.agentName = agentName;
      }

      if (!conversationRooms.has(conversationId)) {
        conversationRooms.set(conversationId, new Set());
      }
      conversationRooms.get(conversationId)?.add(socket.id);

      // Notify others in the conversation
      socket.to(`conversation:${conversationId}`).emit("agent_joined", {
        conversationId,
        agentId,
        agentName,
      });

      // Update database
      try {
        await storage.updateConversation(conversationId, {
          status: "assigned",
          assignedTo: agentId,
          assignedToName: agentName,
        });
      } catch (error) {
        console.error("Error updating conversation:", error);
      }

      console.log(`✅ Agent joined both room formats for ${conversationId}`);
    }
  );
  socket.on(
    "agent_join_conversationOLD",
    async ({ conversationId, agentId, agentName }) => {
      console.log(`Agent ${agentName} joining conversation ${conversationId}`);

      socket.join(`conversation:${conversationId}`);
      socket.join(`conversation_${conversationId}`);

      const user = connectedUsers.get(socket.id);
      if (user) {
        user.conversationId = conversationId;
        user.agentName = agentName;
      }

      if (!conversationRooms.has(conversationId)) {
        conversationRooms.set(conversationId, new Set());
      }
      conversationRooms.get(conversationId)?.add(socket.id);

      // Notify others in the conversation
      socket.to(`conversation:${conversationId}`).emit("agent_joined", {
        conversationId,
        agentId,
        agentName,
      });

      // Update database - assign conversation
      try {
        // You'll need to implement this in your storage
        await storage.updateConversation(conversationId, {
          status: "assigned",
          assignedTo: agentId,
          assignedToName: agentName,
        });
      } catch (error) {
        console.error("Error updating conversation:", error);
      }
    }
  );

  // Agent is typing
  socket.on("agent_typing", ({ conversationId, agentName }) => {
    console.log(`Agent typing in ${conversationId}`);
    socket.to(`conversation:${conversationId}`).emit("agent_typing", {
      conversationId,
      agentName,
    });
  });

  // Agent stopped typing
  socket.on("agent_stopped_typing", ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit("agent_stopped_typing", {
      conversationId,
    });
  });

  // Agent sends message
  socket.on(
    "agent_send_message",
    async ({ conversationId, content, agentId, agentName }) => {
      console.log(`Agent message in ${conversationId}:`, content);

      try {
        // Message is already saved by API endpoint, just broadcast it
        const message = {
          id: `msg_${Date.now()}`, // This will be replaced by actual DB ID
          conversationId,
          content,
          fromUser: false,
          fromType: "agent",
          fromName: agentName,
          createdAt: new Date().toISOString(),
          status: "sent",
        };

        // Broadcast to all participants in the conversation
        io.to(`conversation:${conversationId}`).emit("new_message", {
          conversationId,
          message,
        });

        // Confirm to sender
        socket.emit("message_sent", {
          conversationId,
          status: "delivered",
        });
      } catch (error) {
        console.error("Error sending agent message:", error);
        socket.emit("message_error", {
          error: "Failed to send message",
        });
      }
    }
  );

  // Close conversation
  socket.on("close_conversation", async ({ conversationId, agentId }) => {
    console.log(`Closing conversation ${conversationId}`);

    try {
      // Update database
      // await storage.updateConversation(conversationId, {
      //   status: 'closed'
      // });

      // Notify all participants
      io.to(`conversation:${conversationId}`).emit(
        "conversation_status_changed",
        {
          conversationId,
          status: "closed",
        }
      );
    } catch (error) {
      console.error("Error closing conversation:", error);
    }
  });



  socket.on('join_all_conversations', async ({ channelId }) => {
    // Use the server-tracked identity — never trust userId from client event payload
    const socketUser = connectedUsers.get(socket.id);
    const safeUserId = socketUser?.userId;

    // SECURITY FIX: Verify the user actually owns this channel before joining
    if (safeUserId && channelId) {
      try {
        const userChannels = await storage.getChannelsByUserId(safeUserId);
        const ownsChannel = userChannels.some((ch: any) => ch.id === channelId);
        if (!ownsChannel) {
          socket.emit('error', { message: 'Access denied: you do not own this channel' });
          return;
        }
      } catch (err) {
        console.error('[Socket] Channel ownership check failed:', err);
        socket.emit('error', { message: 'Failed to verify channel ownership' });
        return;
      }
    }

    socket.join(`channel:${channelId}`);
    if (safeUserId) {
      socket.join(`user:${safeUserId}`);
    }
    socket.emit('joined_channel', {
      channelId,
      userId: safeUserId,
      message: 'Successfully joined channel room',
    });
  });

  socket.on('join_conversation', ({ conversationId }: { conversationId: string }) => {
    socket.join(`conversation_${conversationId}`);
    socket.join(`conversation:${conversationId}`);
    if (!conversationRooms.has(conversationId)) {
      conversationRooms.set(conversationId, new Set());
    }
    conversationRooms.get(conversationId)?.add(socket.id);
  });

  socket.on('leave_conversation', ({ conversationId, userId }) => {
    socket.leave(`conversation_${conversationId}`);
    socket.leave(`conversation:${conversationId}`);
    const room = conversationRooms.get(conversationId);
    if (room) {
      room.delete(socket.id);
    }
  });
  // Visitor is typing
  socket.on("user_typing", ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit("user_typing", {
      conversationId,
    });
  });

  // Visitor stopped typing
  socket.on("user_stopped_typing", ({ conversationId }) => {
    socket.to(`conversation:${conversationId}`).emit("user_stopped_typing", {
      conversationId,
    });
  });

  // Conversation opened (mark as read)
  socket.on("conversation_opened", async ({ conversationId }) => {
    console.log(`Conversation opened: ${conversationId}`);

    try {
      // Mark messages as read
      await storage.markMessagesAsRead(conversationId);

      socket.to(`conversation:${conversationId}`).emit("messages_read", {
        conversationId,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Message read
  socket.on("message_read", async ({ conversationId, messageId }) => {
    try {
      // Update message status
      await storage.updateMessage(messageId, {
        status: "read",
        readAt: new Date(),
      });

      socket
        .to(`conversation:${conversationId}`)
        .emit("message_status_update", {
          messageId,
          status: "read",
        });
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  });

  // ==========================================
  // DISCONNECT
  // ==========================================
  socket.on("disconnect", () => {
    console.log("Socket.io client disconnected:", socket.id);

    const user = connectedUsers.get(socket.id);
    if (user?.conversationId) {
      const room = conversationRooms.get(user.conversationId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          conversationRooms.delete(user.conversationId);
        }
      }

      // Notify others
      if (user.role === "visitor") {
        socket.to(`conversation:${user.conversationId}`).emit("user_left", {
          conversationId: user.conversationId,
        });
      }
    }

    connectedUsers.delete(socket.id);
  });
});

// Helper functions
io.getOnlineAgents = function (siteId?: string) {
  const agents: any[] = [];
  connectedUsers.forEach((user) => {
    if (user.role === "agent" || user.role === "admin") {
      if (!siteId || user.siteId === siteId) {
        agents.push(user);
      }
    }
  });
  return agents;
};

io.isConversationActive = function (conversationId: string) {
  const room = conversationRooms.get(conversationId);
  return room && room.size > 0;
};

app.use(cors(function (req: any, callback: any) {
  if (req.path && (req.path.startsWith('/api/widget') || req.path.startsWith('/widget'))) {
    // Widget endpoints must be accessible from any external site
    callback(null, { origin: true, credentials: false });
  } else {
    callback(null, { origin: corsOriginHandler, credentials: true });
  }
}));

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "development" ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://connect.facebook.net", "https://*.facebook.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", "https:", "ws:", "http:"],
      frameSrc: ["'self'", "https://www.facebook.com", "https://web.facebook.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Remove X-Powered-By header (prevents Express fingerprinting)
app.disable('x-powered-by');

// Defense-in-depth: explicit security headers for API routes
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

app.get("/api/version", (_req, res) => {
  res.json({ version: BOTFIZZ_VERSION, product: BOTFIZZ_PRODUCT_NAME });
});

app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use('/webhooks/razorpay', express.raw({ type: 'application/json' }));
app.use('/webhooks/paypal', express.raw({ type: 'application/json' }));
app.use('/webhooks/paystack', express.raw({ type: 'application/json' }));
app.use('/webhooks/mercadopago', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

app.use(
  "/widget",
  express.static(path.join(process.cwd(), "public"), {
    setHeaders: (res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    },
  })
);

// Get online agents
app.get("/api/agents/online", (req, res) => {
  const { siteId } = req.query;
  const agents = io.getOnlineAgents?.(siteId as string) || [];
  res.json({ agents });
});

initializeUploadsDirectory();

// Trust first proxy (needed for secure cookies behind Nginx)
app.set('trust proxy', 1);

// Set up session management
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: SESSION_SECRET environment variable is required in production');
}
if (!sessionSecret) {
  console.warn('[Security] SESSION_SECRET not set — using insecure dev-only fallback. DO NOT deploy to production without this env var.');
}
const secret = sessionSecret || 'dev-only-insecure-secret-do-not-use-in-production';

const PostgresSessionStore = connectPgSimple(session);
const sessionMiddleware = session({
  store: new PostgresSessionStore({
    pool,
    createTableIfMissing: true,
  }),
  name: '_app_session',
  secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE_MS || '', 10) || 24 * 60 * 60 * 1000,
    sameSite: 'strict',
  },
});

app.use(sessionMiddleware);

// Share session with Socket.IO so socket handlers can read socket.request.session
io.engine.use(sessionMiddleware);

app.use(rateLimitMiddleware);

const NEVER_LOG_RESPONSE_BODY = [
  '/api/auth',
  '/api/api-keys',
  '/api/v1/',
  '/api/smtp',
  '/api/storage-settings',
  '/api/ai-settings',
  '/api/payment',
];

function sanitizeLogResponse(body: any): any {
  if (!body || typeof body !== 'object') return body;
  const SENSITIVE_KEYS = ['password', 'token', 'secret', 'apiKey', 'accessToken',
    'smtpPass', 'stripeKey', 'razorpaySecret', 'openaiKey', 'sessionSecret'];
  const sanitized = { ...body };
  for (const key of SENSITIVE_KEYS) {
    if (key in sanitized) sanitized[key] = '[REDACTED]';
  }
  return sanitized;
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const shouldLogBody = !NEVER_LOG_RESPONSE_BODY.some(p => path.startsWith(p));

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    if (shouldLogBody) capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(sanitizeLogResponse(capturedJsonResponse))}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run idempotent startup migration before accepting any requests.
  // Adds all columns/tables that may be missing on client databases that
  // were not updated via db:push after schema changes were committed.
  try {
    await runStartupMigration(pool);
  } catch (err) {
    console.error("[startup-migration] Fatal — aborting server startup:", err);
    process.exit(1);
  }

  const server = await registerRoutes(app, httpServer);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    botfizzLogger.error(`[Express] Error ${status}:`, err);
    const message = status < 500
      ? (err.message || "Request error")
      : process.env.NODE_ENV !== 'production'
        ? (err.message || "Internal Server Error")
        : "Internal Server Error";
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);


  const listenOptions: any = {
    port,
    host: "0.0.0.0",
  };

  if (process.platform === "linux" && process.env.NODE_ENV !== "production") {
    listenOptions.reusePort = true;
  }

  httpServer.listen(listenOptions, async () => {
    botfizzLogger.banner();
    botfizzLogger.success(`Server running on port ${port}`);

    // One-time data fix: mark existing unverified users as inactive
    try {
      const { rowCount } = await pool.query(
        `UPDATE users SET status = 'inactive'
         WHERE is_email_verified IS NOT TRUE AND status NOT IN ('inactive', 'banned')`
      );
      if (rowCount && rowCount > 0) {
        botfizzLogger.success(`[Startup] Set ${rowCount} unverified user(s) to inactive`);
      }
    } catch (err) {
      botfizzLogger.error(`[Startup] Failed to fix unverified user statuses: ${err}`);
    }

    const instanceId = process.env.NODE_APP_INSTANCE;
    const isCronLeader = !instanceId || instanceId === "0";

    if (isCronLeader) {
      botfizzLogger.success(`Worker ${instanceId ?? "main"} is the cron leader — starting scheduled jobs`);

      // Recover campaigns stuck in "queued" with no messages yet in the queue.
      // The in-memory setImmediate queue population is lost on restart, so campaigns
      // that were mid-transition stay "queued" forever without this recovery.
      // NOT EXISTS guard prevents re-queuing campaigns that already have messages
      // inserted (those continue naturally via the message queue worker).
      try {
        const orphaned = await db
          .select()
          .from(campaignsTable)
          .where(
            sql`
              ${campaignsTable.status} = 'queued'
              AND NOT EXISTS (
                SELECT 1 FROM ${messageQueue}
                WHERE ${messageQueue.campaignId} = ${campaignsTable.id}
              )
            `
          );

        if (orphaned.length > 0) {
          botfizzLogger.warn(`[Startup] Found ${orphaned.length} campaign(s) stuck in "queued" — recovering...`);
          for (const c of orphaned) {
            try {
              await storage.updateCampaign(c.id, { status: "active" });
              botfizzLogger.warn(`[Startup] Recovering stuck campaign: ${c.id} (${c.name})`);
              void startCampaignExecution(c.id).catch((err) => {
                botfizzLogger.error(`[Startup] Failed to recover campaign ${c.id}: ${err}`);
                storage.updateCampaign(c.id, { status: "failed" }).catch(() => { });
              });
            } catch (err) {
              botfizzLogger.error(`[Startup] Error recovering campaign ${c.id}: ${err}`);
            }
          }
        } else {
          botfizzLogger.success(`[Startup] No stuck campaigns found`);
        }
      } catch (err) {
        botfizzLogger.error(`[Startup] Failed to check for stuck campaigns: ${err}`);
      }

      // Backfill campaign delivery/read/failed counts from message_queue.
      // Uses monotonic milestone timestamps as source of truth:
      //   delivered = delivered_at IS NOT NULL OR read_at IS NOT NULL (read implies delivery)
      //   read      = read_at IS NOT NULL
      //   failed    = status = 'failed'
      // All campaigns are updated — campaigns with no queue rows get zeros.
      try {
        await db.execute(sql`
          UPDATE campaigns c
          SET
            delivered_count = COALESCE(q.delivered_count, 0),
            read_count      = COALESCE(q.read_count, 0),
            failed_count    = COALESCE(q.failed_count, 0)
          FROM (
            SELECT
              c2.id AS campaign_id,
              COUNT(mq.id) FILTER (
                WHERE mq.delivered_at IS NOT NULL OR mq.read_at IS NOT NULL
              ) AS delivered_count,
              COUNT(mq.id) FILTER (
                WHERE mq.read_at IS NOT NULL
              ) AS read_count,
              COUNT(mq.id) FILTER (
                WHERE mq.status = 'failed'
              ) AS failed_count
            FROM campaigns c2
            LEFT JOIN message_queue mq ON mq.campaign_id = c2.id
            GROUP BY c2.id
          ) q
          WHERE c.id = q.campaign_id
        `);
        botfizzLogger.success(`[Startup] Campaign stats backfilled from message_queue`);
      } catch (err) {
        botfizzLogger.error(`[Startup] Failed to backfill campaign stats: ${err}`);
      }

      // Recover time_gap automation executions that were paused before restart.
      // These would otherwise hang forever since setTimeout is lost on restart.
      try {
        await executionService.recoverTimeGapExecutions();
      } catch (err) {
        botfizzLogger.error(`[Startup] Failed to recover time_gap executions: ${err}`);
      }

      // Re-subscribe all active channels to Meta webhook events.
      // This fixes channels that were created before the auto-subscribe fix,
      // ensuring delivery/read receipts start arriving immediately.
      try {
        const activeChannels = await storage.getChannels();
        const activeOnes = activeChannels.filter((c: any) => c.isActive && c.whatsappBusinessAccountId && c.accessToken);
        let subOk = 0;
        for (const ch of activeOnes) {
          const result = await subscribeChannelToWebhook(ch);
          if (result.success) subOk++;
        }
        if (activeOnes.length > 0) {
          botfizzLogger.success(`[Startup] Re-subscribed ${subOk}/${activeOnes.length} channel(s) to Meta webhooks`);
        }
      } catch (err) {
        botfizzLogger.error(`[Startup] Failed to re-subscribe channels to webhooks: ${err}`);
      }

      startScheduledCampaignCron();

      const messageStatusUpdater = new MessageStatusUpdater();
      messageStatusUpdater.startCronJob(60);

      MessageQueueService.startProcessing();

      const { channelHealthMonitor } = await import(
        "./cron/channel-health-monitor"
      );
      channelHealthMonitor.start();
    } else {
      botfizzLogger.success(`Worker ${instanceId} skipping cron jobs (not the leader)`);
    }
  });
})();
