/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * ============================================================
 *
 * Creates a sample workspace (channel, contacts, templates, conversations,
 * campaigns) so a sandbox account has something real to work with.
 * All people and numbers are fictional; 555-01xx numbers are reserved.
 */

import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { eq, inArray, like } from "drizzle-orm";
import { db } from "../db";
import {
  campaigns,
  channels,
  contacts,
  conversations,
  messageQueue,
  messages,
  templates,
  users,
} from "@shared/schema";
import { defaultPermissions } from "../controllers/user.controller";

export const DEMO_LOGINS = {
  user: { username: "demo", password: "Demo@12345" },
  admin: { username: "demo-admin", password: "Demo@12345" },
};

// Sample businesses, so the admin console has a platform to look after.
const SAMPLE_BUSINESSES = [
  ["northwind", "Northwind", "Traders"],
  ["lumen", "Lumen", "Studio"],
  ["harbor", "Harbor", "Foods"],
  ["atlas", "Atlas", "Travel"],
];

const DAY_MS = 24 * 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const PEOPLE = [
  ["Ayesha Khan", "Retail"],
  ["Bilal Ahmed", "Retail"],
  ["Sara Malik", "VIP"],
  ["Usman Tariq", "Leads"],
  ["Hira Siddiqui", "VIP"],
  ["Omar Farooq", "Leads"],
  ["Zainab Raza", "Retail"],
  ["Hamza Sheikh", "Leads"],
  ["Maryam Iqbal", "VIP"],
  ["Ali Hassan", "Retail"],
  ["Fatima Noor", "Leads"],
  ["Daniyal Butt", "Retail"],
] as const;

const SAMPLE_TEMPLATES = [
  {
    name: "order_confirmation",
    category: "utility",
    body: "Hi {{1}}, your order {{2}} is confirmed. We'll message you when it ships.",
    variables: ["1", "2"],
    bodyVariables: 2,
  },
  {
    name: "winter_sale",
    category: "marketing",
    body: "Hi {{1}}! Our winter sale is live: 30% off everything until Sunday.",
    variables: ["1"],
    bodyVariables: 1,
  },
  {
    name: "appointment_reminder",
    category: "utility",
    body: "Reminder: your appointment is on {{1}} at {{2}}. Reply YES to confirm.",
    variables: ["1", "2"],
    bodyVariables: 2,
  },
  {
    name: "welcome_message",
    category: "marketing",
    body: "Welcome to our store, {{1}}! Reply MENU to see what we can help with.",
    variables: ["1"],
    bodyVariables: 1,
  },
];

const THREADS: Array<Array<[direction: "in" | "out", text: string]>> = [
  [
    ["in", "Hi, is the blue jacket available in medium?"],
    ["out", "Hi Ayesha! Yes, we have 4 left in medium."],
    ["in", "Great, can you deliver to Lahore?"],
    ["out", "Yes, delivery takes 2 days."],
    ["in", "Perfect, I'll order today."],
  ],
  [
    ["in", "Where is my order?"],
    ["out", "Let me check. Could you share your order number?"],
    ["in", "It's #4821"],
    ["out", "It left our warehouse this morning and arrives tomorrow."],
  ],
  [
    ["out", "Hi Sara, your VIP early access starts tonight."],
    ["in", "Amazing, thank you!"],
  ],
  [
    ["in", "Do you offer bulk pricing?"],
    ["out", "We do, for orders above 50 units. How many do you need?"],
    ["in", "Around 120"],
  ],
  [
    ["in", "Can I reschedule my appointment?"],
    ["out", "Of course. Which day works for you?"],
    ["in", "Thursday afternoon"],
    ["out", "Booked for Thursday at 3 PM."],
    ["in", "Thanks!"],
  ],
  [
    ["out", "Thanks for your interest, Omar! Want a quick product tour?"],
    ["in", "Yes please"],
  ],
  [
    ["in", "My discount code isn't working"],
    ["out", "Sorry about that! Here's a new one: WINTER30"],
    ["in", "That worked, thanks"],
  ],
  [["in", "What are your opening hours?"]],
];

async function createWorkspace(ownerId: string) {
  return db.transaction(async (tx) => {
    const suffix = ownerId.slice(0, 8);
    const [channel] = await tx
      .insert(channels)
      .values({
        name: "Sandbox Channel",
        phoneNumberId: `sandbox-${suffix}`,
        accessToken: "sandbox",
        whatsappBusinessAccountId: `sandbox-waba-${suffix}`,
        phoneNumber: "+15550100000",
        isActive: true,
        healthStatus: "healthy",
        lastHealthCheck: new Date(),
        healthDetails: {
          status: "SANDBOX",
          quality_rating: "GREEN",
          messaging_limit: "TIER_UNLIMITED",
          verified_name: "Botfizz Sandbox",
        },
        connectionMethod: "manual",
        createdBy: ownerId,
      })
      .returning();

    const now = Date.now();

    const contactRows = await tx
      .insert(contacts)
      .values(
        PEOPLE.map(([name, group], i) => ({
          channelId: channel.id,
          name,
          phone: `1555010${String(i + 1).padStart(4, "0")}`,
          email: `${name.split(" ")[0].toLowerCase()}@example.com`,
          groups: [group],
          tags: [group],
          source: "manual",
          createdBy: ownerId,
          createdAt: new Date(now - i * 2 * DAY_MS),
        })),
      )
      .returning();

    const templateRows = await tx
      .insert(templates)
      .values(
        SAMPLE_TEMPLATES.map((t, i) => ({
          ...t,
          channelId: channel.id,
          createdBy: ownerId,
          status: "APPROVED",
          whatsappTemplateId: `sandbox-tpl-${suffix}-${i}`,
        })),
      )
      .returning();

    for (const [index, thread] of THREADS.entries()) {
      const contact = contactRows[index];
      const start = now - (index * 2 + 0.2) * DAY_MS;
      const stamp = (i: number) => new Date(start + i * 7 * MINUTE_MS);
      const last = thread[thread.length - 1];

      const [conversation] = await tx
        .insert(conversations)
        .values({
          channelId: channel.id,
          contactId: contact.id,
          contactPhone: contact.phone,
          contactName: contact.name,
          status: "open",
          unreadCount: last[0] === "in" && index < 4 ? 1 : 0,
          lastMessageAt: stamp(thread.length - 1),
          lastIncomingMessageAt: new Date(),
          lastMessageText: last[1],
          createdAt: stamp(0),
        })
        .returning();

      await tx.insert(messages).values(
        thread.map(([direction, content], i) => ({
          conversationId: conversation.id,
          whatsappMessageId: `wamid.SANDBOX.seed.${suffix}.${index}.${i}`,
          fromUser: direction === "in",
          direction: direction === "in" ? "inbound" : "outbound",
          content,
          type: "text",
          messageType: "text",
          fromType: direction === "in" ? "user" : "agent",
          status: direction === "in" ? "received" : i % 3 === 0 ? "delivered" : "read",
          timestamp: stamp(i),
          createdAt: stamp(i),
        })),
      );
    }

    const campaignRows = await tx.insert(campaigns).values([
      {
        channelId: channel.id,
        createdBy: ownerId,
        name: "Winter Sale Launch",
        campaignType: "contacts",
        type: "marketing",
        apiType: "cloud_api",
        templateId: templateRows[1].id,
        templateName: templateRows[1].name,
        templateLanguage: "en_US",
        status: "completed",
        recipientCount: 12,
        sentCount: 12,
        deliveredCount: 11,
        readCount: 8,
        repliedCount: 3,
        failedCount: 1,
        completedAt: new Date(now - 3 * DAY_MS),
        createdAt: new Date(now - 3 * DAY_MS),
      },
      {
        channelId: channel.id,
        createdBy: ownerId,
        name: "New Customer Welcome",
        campaignType: "contacts",
        type: "marketing",
        apiType: "cloud_api",
        templateId: templateRows[3].id,
        templateName: templateRows[3].name,
        templateLanguage: "en_US",
        status: "completed",
        recipientCount: 6,
        sentCount: 6,
        deliveredCount: 6,
        readCount: 5,
        repliedCount: 2,
        failedCount: 0,
        completedAt: new Date(now - 9 * DAY_MS),
        createdAt: new Date(now - 9 * DAY_MS),
      },
    ]).returning();

    // Startup recomputes campaign counts from the queue, so the sample
    // campaigns need matching queue rows to keep their numbers.
    for (const campaign of campaignRows) {
      const sentAt = campaign.createdAt!;
      await tx.insert(messageQueue).values(
        Array.from({ length: campaign.recipientCount! }, (_, i) => {
          const delivered = i < campaign.deliveredCount!;
          return {
            campaignId: campaign.id,
            channelId: channel.id,
            recipientPhone: contactRows[i % contactRows.length].phone,
            templateName: campaign.templateName,
            messageType: "marketing",
            status: delivered ? "delivered" : "failed",
            sentVia: "cloud_api",
            processedAt: sentAt,
            deliveredAt: delivered ? sentAt : null,
            readAt: i < campaign.readCount! ? sentAt : null,
            createdAt: sentAt,
          };
        }),
      );
    }

    return channel;
  });
}

/** Returns the owner's sandbox channel, creating the workspace on first use. */
export async function provisionWorkspace(ownerId: string) {
  const [existing] = await db
    .select()
    .from(channels)
    .where(eq(channels.createdBy, ownerId))
    .limit(1);

  return existing ?? createWorkspace(ownerId);
}

/**
 * WhatsApp only allows free-form replies within 24 hours of the customer's last
 * message. Sample chats age past that, so reopen their window on each start.
 */
async function reopenMessagingWindows() {
  const sandboxChannels = db
    .select({ id: channels.id })
    .from(channels)
    .where(like(channels.phoneNumberId, "sandbox-%"));

  await db
    .update(conversations)
    .set({ lastIncomingMessageAt: new Date() })
    .where(inArray(conversations.channelId, sandboxChannels));
}

async function ensureUser(
  username: string,
  password: string,
  firstName: string,
  lastName: string,
  role: "admin" | "superadmin",
) {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      username,
      password: await bcrypt.hash(password, 10),
      email: `${username}@example.com`,
      firstName,
      lastName,
      role,
      permissions: defaultPermissions,
      isEmailVerified: true,
      status: "active",
    })
    .returning();
  return created;
}

/** Makes sure both demo accounts exist, each with a populated workspace. */
export async function ensureDemoAccounts() {
  const { user, admin } = DEMO_LOGINS;
  const owners = [
    await ensureUser(user.username, user.password, "Demo", "User", "admin"),
    await ensureUser(admin.username, admin.password, "Demo", "Admin", "superadmin"),
  ];

  for (const [username, firstName, lastName] of SAMPLE_BUSINESSES) {
    owners.push(await ensureUser(username, randomUUID(), firstName, lastName, "admin"));
  }

  for (const owner of owners) await provisionWorkspace(owner.id);
  await reopenMessagingWindows();
}
