/**
 * The static demo (VITE_DEMO_MODE=true) runs with no server. It answers the
 * app's /api calls in the browser, from responses recorded off the real
 * server with fictional sample data. Changes live in memory and reset on reload.
 */

import { broadcast } from "./socket";

type Json = any;
type Role = "user" | "admin";

const SESSION_KEY = "bf-demo-session";
const REPLIES = [
  "Thanks, that helps!",
  "Great, please go ahead.",
  "Can you share more details?",
  "Perfect, thank you 🙌",
];
const INBOUND = [
  "Hi! Do you ship internationally?",
  "Can I change my delivery address?",
  "Is there a discount for first-time customers?",
  "How do I track my order?",
];

const DEMO_LOGINS = {
  user: { username: "demo", password: "Demo@12345" },
  admin: { username: "demo-admin", password: "Demo@12345" },
};

const realFetch = window.fetch.bind(window);
let store: Record<string, Json> = {};
let replyCount = 0;

const newId = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const clean = (url: URL) => url.pathname + url.search;

function json(body: Json, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function sessionRole() {
  return localStorage.getItem(SESSION_KEY) as Role | null;
}

/** The array inside a list response, whatever shape the endpoint uses. */
function listIn(body: Json): Json[] | null {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    return (Object.values(body).find(Array.isArray) as Json[]) ?? null;
  }
  return null;
}

function walk(value: Json, visit: (object: Json, parent: Json[] | null, index: number) => void) {
  if (Array.isArray(value)) {
    for (let i = value.length - 1; i >= 0; i--) {
      const item = value[i];
      if (item && typeof item === "object") {
        visit(item, value, i);
        walk(item, visit);
      }
    }
  } else if (value && typeof value === "object") {
    visit(value, null, -1);
    Object.values(value).forEach((child) => walk(child, visit));
  }
}

function updateRecord(id: string, changes: Json) {
  let found: Json;
  Object.values(store).forEach((body) =>
    walk(body, (object) => {
      if (object.id === id) {
        Object.assign(object, changes);
        found = object;
      }
    }),
  );
  return found;
}

function removeRecord(id: string) {
  Object.values(store).forEach((body) =>
    walk(body, (object, parent, index) => {
      if (object.id === id && parent) parent.splice(index, 1);
    }),
  );
}

function recordExists(id: string) {
  let exists = false;
  Object.values(store).forEach((body) =>
    walk(body, (object) => {
      if (object.id === id) exists = true;
    }),
  );
  return exists;
}

function createRecord(path: string, data: Json) {
  const record = { id: newId(), status: "active", createdAt: now(), updatedAt: now(), ...data };
  if (path === "/api/campaigns") {
    const count = Number(data.recipientCount ?? 0);
    Object.assign(record, {
      status: "completed",
      sentCount: count,
      deliveredCount: count,
      readCount: Math.round(count * 0.7),
      repliedCount: 0,
      failedCount: 0,
    });
  }
  for (const [key, body] of Object.entries(store)) {
    if (key.split("?")[0] !== path) continue;
    const list = listIn(body);
    if (list) list.unshift(record);
    if (body?.total !== undefined) body.total += 1;
  }
  return record;
}

function messagesOf(conversationId: string) {
  const key = Object.keys(store).find((k) => k.startsWith(`/api/conversations/${conversationId}/messages`));
  if (key) return listIn(store[key]) ?? [];
  const list: Json[] = [];
  store[`/api/conversations/${conversationId}/messages`] = list;
  return list;
}

function addMessage(conversationId: string, fields: Json) {
  const list = messagesOf(conversationId);
  const message = {
    id: newId(),
    conversationId,
    type: "text",
    messageType: "text",
    createdAt: now(),
    timestamp: now(),
    ...fields,
  };
  const newestFirst =
    list.length > 1 && new Date(list[0].createdAt) > new Date(list[list.length - 1].createdAt);
  if (newestFirst) list.unshift(message);
  else list.push(message);

  updateRecord(conversationId, { lastMessageText: fields.content, lastMessageAt: message.createdAt });
  broadcast("message_sent", { conversationId, message });
  return message;
}

function sendMessage(conversationId: string, content: string) {
  const message = addMessage(conversationId, {
    content,
    fromUser: true,
    fromType: "agent",
    direction: "outbound",
    status: "sent",
  });

  setTimeout(() => {
    updateRecord(message.id, { status: "read" });
    broadcast("message_sent", { conversationId });
  }, 1500);

  setTimeout(() => {
    addMessage(conversationId, {
      content: REPLIES[replyCount++ % REPLIES.length],
      fromUser: false,
      fromType: "user",
      direction: "inbound",
      status: "received",
    });
  }, 3500);

  return message;
}

function simulateInbound() {
  const key = Object.keys(store).find((k) => k.split("?")[0] === "/api/conversations");
  const conversations = key ? listIn(store[key]) ?? [] : [];
  if (conversations.length === 0) return json({ error: "No conversations" }, 400);

  const conversation = conversations[Math.floor(Math.random() * conversations.length)];
  const text = INBOUND[Math.floor(Math.random() * INBOUND.length)];
  addMessage(conversation.id, {
    content: text,
    fromUser: false,
    fromType: "user",
    direction: "inbound",
    status: "received",
  });
  conversation.unreadCount = (conversation.unreadCount ?? 0) + 1;
  return json({ success: true, from: conversation.contactName, text });
}

function search(body: Json, term: string) {
  const list = listIn(body);
  if (!list) return body;
  const matches = list.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  return Array.isArray(body) ? matches : { ...body, [arrayKey(body)]: matches };
}

function arrayKey(body: Json) {
  return Object.keys(body).find((key) => Array.isArray(body[key]))!;
}

function readGet(url: URL) {
  const term = url.searchParams.get("search");
  if (term) url.searchParams.delete("search");

  let body = store[clean(url)];
  if (body === undefined) {
    const key = Object.keys(store).find((k) => k.split("?")[0] === url.pathname);
    body = key ? store[key] : [];
  }
  return json(term ? search(body, term.toLowerCase()) : body);
}

async function readBody(init?: RequestInit): Promise<Json> {
  const body = init?.body;
  if (body instanceof FormData) return Object.fromEntries(body.entries());
  if (typeof body !== "string") return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

async function handle(url: URL, method: string, init?: RequestInit) {
  const path = url.pathname;

  if (path === "/api/auth/me" && !sessionRole()) return json({ error: "Not authenticated" }, 401);
  if (path === "/api/auth/check") return json({ authenticated: !!sessionRole() });
  if (method === "GET") return readGet(url);

  const data = await readBody(init);

  if (path === "/api/auth/login") {
    const role = data.username === DEMO_LOGINS.admin.username ? "admin" : "user";
    localStorage.setItem(SESSION_KEY, role);
    return json({ message: "Login successful" });
  }
  if (path === "/api/auth/logout") {
    localStorage.removeItem(SESSION_KEY);
    return json({ success: true });
  }
  if (path === "/api/sandbox/simulate-inbound") return simulateInbound();

  const recorded = store[`POST ${path}`];
  if (recorded !== undefined) return json(recorded);

  const conversation = path.match(/^\/api\/conversations\/([^/]+)\/messages$/);
  if (method === "POST" && conversation) {
    return json(sendMessage(conversation[1], data.content ?? ""));
  }

  const id = path.split("/").find(recordExists);
  if (method === "DELETE") {
    if (id) removeRecord(id);
    return json({ success: true });
  }
  if (id) {
    const isAction = !path.endsWith(id);
    const updated = isAction ? { success: true } : updateRecord(id, data);
    return json({ success: true, ...updated, data: updated });
  }

  const isCollection = Object.keys(store).some((key) => key.split("?")[0] === path);
  if (isCollection) {
    const record = createRecord(path, data);
    return json({ success: true, ...record, data: record });
  }
  return json({ success: true });
}

/** Moves every recorded date forward, so the sample data always looks recent. */
function refreshDates(fixture: string) {
  const capturedAt = Number(fixture.match(/"__capturedAt":(\d+)/)?.[1] ?? Date.now());
  const shift = Date.now() - capturedAt;
  return fixture.replace(/"(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?)?"/g, (match, day, time) => {
    const date = new Date(`${day}${time ?? "T12:00:00Z"}`);
    if (Number.isNaN(date.getTime())) return match;
    const moved = new Date(date.getTime() + shift).toISOString();
    return `"${time ? moved : moved.slice(0, 10)}"`;
  });
}

export async function installDemoApi() {
  const role = sessionRole() ?? "user";
  const fixture = await realFetch(`/demo/${role}.json`).then((res) => res.text());
  store = JSON.parse(refreshDates(fixture));
  store["/api/sandbox/status"] = { enabled: true, demoLogins: DEMO_LOGINS };

  window.fetch = async (input, init) => {
    const raw = input instanceof Request ? input.url : String(input);
    const url = new URL(raw, window.location.origin + "/");
    const isApi = url.origin === window.location.origin && url.pathname.startsWith("/api/");
    if (!isApi) return realFetch(input, init);

    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    return handle(url, method, init);
  };
}
