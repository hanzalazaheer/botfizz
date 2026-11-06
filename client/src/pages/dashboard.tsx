/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { useState, type ComponentType } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CheckCheck,
  CheckCircle2,
  FileText,
  Globe,
  Inbox,
  LifeBuoy,
  Loader2,
  Megaphone,
  MessageSquarePlus,
  Palette,
  Radio,
  ScrollText,
  Send,
  Settings as SettingsIcon,
  Users,
  Workflow,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/header";
import AdminStats from "@/components/AdminStats";
import { MessageChart } from "@/components/charts/message-chart";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useActiveChannel } from "@/hooks/use-active-channel";
import { useAnalytics, useDashboardStats } from "@/hooks/use-dashboard";
import { useToast } from "@/hooks/use-toast";
import { getExplored } from "@/lib/explored";
import { apiRequest } from "@/lib/queryClient";

type Tile = {
  href: string;
  label: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
};

const BUSINESS_TILES: Tile[] = [
  { href: "/inbox", label: "Reply in the Team Inbox", hint: "Answer a waiting customer", icon: Inbox, tone: "bg-green-100 text-green-700" },
  { href: "/widget-builder", label: "Design your chat widget", hint: "Restyle it and watch it change", icon: Palette, tone: "bg-teal-100 text-teal-700" },
  { href: "/automation", label: "Build a bot flow", hint: "Drag steps onto the canvas", icon: Workflow, tone: "bg-indigo-100 text-indigo-700" },
  { href: "/campaigns", label: "Launch a campaign", hint: "Reach a whole group at once", icon: Megaphone, tone: "bg-orange-100 text-orange-700" },
  { href: "/templates", label: "Write a template", hint: "Save a message to reuse", icon: FileText, tone: "bg-purple-100 text-purple-700" },
  { href: "/contacts", label: "Organise your contacts", hint: "Search, tag and add people", icon: Users, tone: "bg-blue-100 text-blue-700" },
  { href: "/analytics", label: "Read your analytics", hint: "See what's working", icon: BarChart3, tone: "bg-pink-100 text-pink-700" },
  { href: "/settings", label: "Tour the settings", hint: "Team, channels and more", icon: SettingsIcon, tone: "bg-gray-100 text-gray-700" },
];

const ADMIN_TILES: Tile[] = [
  { href: "/users", label: "Manage businesses", hint: "Every account on the platform", icon: Users, tone: "bg-blue-100 text-blue-700" },
  { href: "/channels-management", label: "Monitor channels", hint: "Health across all numbers", icon: Radio, tone: "bg-green-100 text-green-700" },
  { href: "/message-logs", label: "Inspect message logs", hint: "Trace any message", icon: ScrollText, tone: "bg-indigo-100 text-indigo-700" },
  { href: "/support-tickets", label: "Handle support tickets", hint: "Help the businesses you host", icon: LifeBuoy, tone: "bg-orange-100 text-orange-700" },
  { href: "/languages", label: "Manage languages", hint: "Translate the whole interface", icon: Globe, tone: "bg-teal-100 text-teal-700" },
  { href: "/notifications", label: "Send announcements", hint: "Notify every business", icon: Bell, tone: "bg-pink-100 text-pink-700" },
  { href: "/campaigns", label: "Review campaigns", hint: "See what's being sent", icon: Megaphone, tone: "bg-purple-100 text-purple-700" },
  { href: "/analytics", label: "Read platform analytics", hint: "Volume and delivery", icon: BarChart3, tone: "bg-gray-100 text-gray-700" },
];

function ExploreFeatures({ tiles }: { tiles: Tile[] }) {
  const explored = getExplored();
  const done = tiles.filter((tile) => explored.includes(tile.href)).length;
  const finished = done === tiles.length;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-semibold text-gray-900">
            {finished ? "You've seen everything. Nicely done!" : "Explore every feature"}
          </h2>
          <p className="text-sm text-gray-500">
            {finished
              ? "Change anything you like. It's all sample data."
              : "Click each one. Everything here works, and nothing can break."}
          </p>
        </div>
        <p className="text-sm font-medium tabular-nums text-green-700">
          {done} of {tiles.length} explored
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${(done / tiles.length) * 100}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ href, label, hint, icon: Icon, tone }) => {
          const seen = explored.includes(href);
          return (
            <Link
              key={href}
              href={href}
              className="group relative rounded-xl border border-gray-200 p-4 transition hover:-translate-y-0.5 hover:border-green-500 hover:shadow-md"
            >
              {seen ? (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" aria-label="Explored" />
              ) : (
                <ArrowRight className="absolute right-3 top-3 h-4 w-4 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-green-600" />
              )}
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-3 pr-5 text-sm font-semibold text-gray-900">{label}</p>
              <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const percent = (part = 0, total = 0) =>
  total > 0 ? `${Math.round((part / total) * 100)}%` : "—";

function Stat({
  href,
  label,
  value,
  note,
  icon: Icon,
}: {
  href: string;
  label: string;
  value: string | number;
  note: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-200 bg-white p-5 transition hover:border-green-500"
    >
      <div className="flex items-center justify-between text-sm text-gray-500">
        {label}
        <Icon className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{note}</p>
    </Link>
  );
}

function ConnectChannel({ sandboxEnabled }: { sandboxEnabled: boolean }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const provision = useMutation({
    mutationFn: () => apiRequest("POST", "/api/sandbox/provision"),
    onSuccess: () => queryClient.invalidateQueries(),
    onError: () =>
      toast({ title: "Could not set up the workspace", variant: "destructive" }),
  });

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-8 text-center">
      <Zap className="mx-auto h-8 w-8 text-green-600" />
      <h2 className="mt-3 text-xl font-semibold text-gray-900">Set up your workspace</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
        {sandboxEnabled
          ? "Create a sandbox channel with sample contacts and conversations, or connect your own WhatsApp number."
          : "Connect a WhatsApp Business number to start messaging customers."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {sandboxEnabled && (
          <Button
            className="bg-green-600 hover:bg-green-700"
            disabled={provision.isPending}
            onClick={() => provision.mutate()}
          >
            {provision.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create sandbox workspace
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/settings">Connect WhatsApp</Link>
        </Button>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [days, setDays] = useState(14);

  const { data: channel, isLoading: channelLoading } = useActiveChannel();
  const { data: stats } = useDashboardStats(channel?.id, user?.id);
  const { data: analytics = [] } = useAnalytics(days, channel?.id);

  const { data: sandbox } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/sandbox/status"],
    queryFn: () => fetch("/api/sandbox/status").then((res) => res.json()),
  });

  const { data: conversations = [] } = useQuery<any[]>({
    queryKey: ["/api/conversations", channel?.id],
    enabled: !!channel?.id,
    refetchInterval: 10000,
    queryFn: async () => {
      const res = await fetch(`/api/conversations?channelId=${channel.id}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      const body = await res.json();
      return Array.isArray(body) ? body : body.data ?? body.conversations ?? [];
    },
  });

  const simulateInbound = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/sandbox/simulate-inbound")).json(),
    onSuccess: (result) => {
      toast({ title: `New message from ${result.from}`, description: result.text });
      setTimeout(() => queryClient.invalidateQueries(), 800);
    },
    onError: () => toast({ title: "Could not simulate a message", variant: "destructive" }),
  });

  const chartData = (analytics as any[]).map((row) => ({
    date: new Date(row.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    sent: Number(row.messagesSent ?? 0),
    delivered: Number(row.messagesDelivered ?? 0),
    read: Number(row.messagesRead ?? 0),
    failed: 0,
  }));

  const recent = [...conversations]
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime(),
    )
    .slice(0, 6);

  const firstName = user?.firstName || user?.username || "there";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={`Hi, ${firstName}`}
        subtitle={channel ? `Channel: ${channel.name}` : "No channel connected yet"}
      />

      <main className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        {user?.role === "superadmin" && <AdminStats />}

        {!channelLoading && !channel && (
          <ConnectChannel sandboxEnabled={!!sandbox?.enabled} />
        )}

        {channel && <ExploreFeatures tiles={user?.role === "superadmin" ? ADMIN_TILES : BUSINESS_TILES} />}

        {channel && (
          <>
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat
                href="/contacts"
                label="Contacts"
                value={stats?.totalContacts ?? 0}
                note={`${stats?.weekContacts ?? 0} added this week`}
                icon={Users}
              />
              <Stat
                href="/analytics"
                label="Messages sent"
                value={stats?.messagesSent ?? 0}
                note={`${stats?.todayMessages ?? 0} today`}
                icon={Send}
              />
              <Stat
                href="/analytics"
                label="Delivered"
                value={percent(stats?.messagesDelivered, stats?.messagesSent)}
                note={`${stats?.messagesDelivered ?? 0} messages`}
                icon={CheckCheck}
              />
              <Stat
                href="/campaigns"
                label="Campaigns"
                value={stats?.totalCampaigns ?? 0}
                note={`${stats?.totalTemplates ?? 0} templates ready`}
                icon={Megaphone}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-5">
              <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Message activity</h2>
                  <select
                    aria-label="Time range"
                    className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700"
                    value={days}
                    onChange={(event) => setDays(Number(event.target.value))}
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                  </select>
                </div>
                {chartData.length > 0 ? (
                  <div className="h-72">
                    <MessageChart data={chartData} />
                  </div>
                ) : (
                  <p className="py-20 text-center text-sm text-gray-500">
                    No messages in this period yet.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Recent conversations</h2>
                  <Link
                    href="/inbox"
                    className="inline-flex items-center gap-1 text-sm text-green-700 hover:underline"
                  >
                    Open inbox <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {recent.length === 0 ? (
                  <p className="py-16 text-center text-sm text-gray-500">No conversations yet.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {recent.map((conversation) => (
                      <li key={conversation.id}>
                        <Link href="/inbox" className="flex items-center gap-3 py-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-medium text-green-700">
                            {(conversation.contactName || conversation.contactPhone || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-gray-900">
                              {conversation.contactName || conversation.contactPhone}
                            </span>
                            <span className="block truncate text-xs text-gray-500">
                              {conversation.lastMessageText}
                            </span>
                          </span>
                          <span className="shrink-0 text-right text-xs text-gray-400">
                            {conversation.lastMessageAt &&
                              formatDistanceToNow(new Date(conversation.lastMessageAt), {
                                addSuffix: true,
                              })}
                            {conversation.unreadCount > 0 && (
                              <span className="mt-1 block font-semibold text-green-600">
                                {conversation.unreadCount} new
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {sandbox?.enabled && (
              <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-green-300 bg-green-50 p-4">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-green-700" />
                  <p className="text-sm text-green-900">
                    Sandbox mode: messages stay on this computer and customers are simulated.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="bg-white"
                  disabled={simulateInbound.isPending}
                  onClick={() => simulateInbound.mutate()}
                >
                  <MessageSquarePlus className="mr-2 h-4 w-4" />
                  Simulate a customer message
                </Button>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
