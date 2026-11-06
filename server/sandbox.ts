/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * ============================================================
 *
 * Sandbox mode: run the whole product with no Meta account.
 *
 * With SANDBOX_MODE=true every call to the WhatsApp Graph API is answered
 * locally, so the controllers, queues and campaign code run unchanged.
 * Delivery receipts and customer replies are posted to our own webhook in
 * Meta's payload format, so they exercise the real inbound pipeline
 * (inbox, automations, sockets, analytics).
 *
 * Email is captured the same way and printed to the server log.
 *
 * No message ever leaves this machine. It is refused in production.
 */

import "dotenv/config";
import axios from "axios";
import nodemailer from "nodemailer";

export const SANDBOX_MODE =
  process.env.SANDBOX_MODE === "true" && process.env.NODE_ENV !== "production";

const REPLY_MIN_GAP_MS = 20_000;
const MAX_REPLIES_PER_CONTACT = 10;

const CUSTOMER_REPLIES = [
  "Thanks, that helps!",
  "Is this still available?",
  "Can you share more details?",
  "Great, please go ahead.",
  "What time are you open today?",
  "Perfect, thank you 🙌",
];

const replyState = new Map<string, { count: number; lastAt: number }>();
let messageCounter = 0;

const newWamid = () => `wamid.SANDBOX.${Date.now()}.${++messageCounter}`;

function webhookUrl() {
  return `http://127.0.0.1:${process.env.PORT || 5000}/webhook/global`;
}

async function postWebhook(value: Record<string, unknown>) {
  try {
    await realFetch(webhookUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        object: "whatsapp_business_account",
        entry: [{ id: "sandbox", changes: [{ field: "messages", value }] }],
      }),
    });
  } catch (err) {
    console.error("[Sandbox] Webhook post failed:", (err as Error).message);
  }
}

const metadata = (phoneNumberId: string) => ({
  display_phone_number: "15550100000",
  phone_number_id: phoneNumberId,
});

function postStatus(phoneNumberId: string, id: string, to: string, status: string) {
  return postWebhook({
    messaging_product: "whatsapp",
    metadata: metadata(phoneNumberId),
    statuses: [
      {
        id,
        status,
        recipient_id: to,
        timestamp: String(Math.floor(Date.now() / 1000)),
      },
    ],
  });
}

/** Deliver a simulated customer message through the real webhook handler. */
export function simulateInboundMessage(
  phoneNumberId: string,
  from: string,
  name: string,
  body: string,
) {
  return postWebhook({
    messaging_product: "whatsapp",
    metadata: metadata(phoneNumberId),
    contacts: [{ profile: { name }, wa_id: from }],
    messages: [
      {
        from,
        id: newWamid(),
        timestamp: String(Math.floor(Date.now() / 1000)),
        type: "text",
        text: { body },
      },
    ],
  });
}

function scheduleLifecycle(phoneNumberId: string, id: string, to: string, type?: string) {
  setTimeout(() => postStatus(phoneNumberId, id, to, "delivered"), 1500);
  setTimeout(() => postStatus(phoneNumberId, id, to, "read"), 3500);

  // Only 1:1 text gets a reply, and it is capped, so an automation that
  // answers every message can't loop forever with the simulated customer.
  if (type !== "text") return;
  const state = replyState.get(to) ?? { count: 0, lastAt: 0 };
  if (state.count >= MAX_REPLIES_PER_CONTACT) return;
  if (Date.now() - state.lastAt < REPLY_MIN_GAP_MS) return;
  replyState.set(to, { count: state.count + 1, lastAt: Date.now() });

  const reply = CUSTOMER_REPLIES[state.count % CUSTOMER_REPLIES.length];
  setTimeout(() => simulateInboundMessage(phoneNumberId, to, "", reply), 5000);
}

async function listTemplates(wabaId: string, name: string | null) {
  const { db } = await import("./db");
  const { channels, templates } = await import("@shared/schema");
  const { and, eq } = await import("drizzle-orm");

  const rows = await db
    .select({ t: templates })
    .from(templates)
    .innerJoin(channels, eq(templates.channelId, channels.id))
    .where(
      and(
        eq(channels.whatsappBusinessAccountId, wabaId),
        name ? eq(templates.name, name) : undefined,
      ),
    );

  return rows.map(({ t }) => ({
    id: t.whatsappTemplateId || t.id,
    name: t.name,
    status: "APPROVED",
    category: t.category.toUpperCase(),
    language: t.language || "en_US",
    components: [{ type: "BODY", text: t.body }],
  }));
}

const phoneNumberInfo = (id: string) => ({
  id,
  verified_name: "Botfizz Sandbox",
  display_phone_number: "+1 555 010 0000",
  account_mode: "SANDBOX",
  name_status: "APPROVED",
  quality_rating: "GREEN",
  messaging_limit_tier: "TIER_UNLIMITED",
  code_verification_status: "VERIFIED",
  platform_type: "CLOUD_API",
  health_status: { can_send_message: "AVAILABLE" },
  throughput: { level: "STANDARD" },
});

async function respond(method: string, url: URL, body: any): Promise<any> {
  const segments = url.pathname.split("/").filter(Boolean).slice(1); // drop version
  const [node, edge] = segments;

  if (method === "POST" && (edge === "messages" || edge === "marketing_messages")) {
    const to = String(body?.to ?? "");
    const id = newWamid();
    scheduleLifecycle(node, id, to, body?.type);
    return {
      messaging_product: "whatsapp",
      contacts: [{ input: to, wa_id: to }],
      messages: [{ id, message_status: "accepted" }],
    };
  }

  if (edge === "message_templates") {
    if (method === "GET") {
      return { data: await listTemplates(node, url.searchParams.get("name")) };
    }
    if (method === "POST") {
      return { id: `sandbox-tpl-${Date.now()}`, status: "APPROVED", category: body?.category };
    }
    return { success: true };
  }

  if (edge === "subscribed_apps") {
    return { success: true, data: [{ whatsapp_business_api_data: { id: "sandbox-app" } }] };
  }
  if (edge === "media") return { id: `sandbox-media-${Date.now()}` };
  if (edge === "uploads") return { id: `upload:sandbox-${Date.now()}`, h: `sandbox-handle-${Date.now()}` };
  if (edge) return { success: true, data: [] };
  if (method === "GET") return phoneNumberInfo(node);
  return { success: true };
}

const isGraphUrl = (url: string) => url.includes("graph.facebook.com");

function parseBody(raw: unknown) {
  if (typeof raw !== "string") return raw ?? {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const realFetch = globalThis.fetch;

if (SANDBOX_MODE) {
  globalThis.fetch = async (input, init) => {
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!isGraphUrl(url)) return realFetch(input, init);

    const method = (init?.method || "GET").toUpperCase();
    const data = await respond(method, new URL(url), parseBody(init?.body));
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  axios.interceptors.request.use((config) => {
    if (config.url && isGraphUrl(config.url)) {
      config.adapter = async (cfg) => ({
        data: await respond(
          (cfg.method || "get").toUpperCase(),
          new URL(cfg.url!),
          parseBody(cfg.data),
        ),
        status: 200,
        statusText: "OK",
        headers: {},
        config: cfg,
      });
    }
    return config;
  });

  const createTransport = nodemailer.createTransport.bind(nodemailer);
  (nodemailer as any).createTransport = () => {
    const transport = createTransport({ jsonTransport: true });
    const sendMail = transport.sendMail.bind(transport);
    (transport as any).sendMail = (mail: any) => {
      console.log(`[Sandbox] Email to ${mail.to}: ${mail.subject}\n${mail.text ?? ""}`);
      return sendMail(mail);
    };
    return transport;
  };

  console.log("[Sandbox] Enabled — WhatsApp traffic is simulated locally, nothing is sent.");
} else if (process.env.SANDBOX_MODE === "true") {
  console.warn("[Sandbox] Ignored: SANDBOX_MODE cannot be used with NODE_ENV=production.");
}
