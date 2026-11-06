/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * ============================================================
 *
 * Botfizz is an open-source project, so there are no public accounts:
 * visitors enter through one of the demo logins. A self-hosted install
 * without demo mode falls back to a plain sign-in form.
 */

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight, LayoutDashboard, Loader2, ShieldCheck } from "lucide-react";
import "./home.css";

type Credentials = { username: string; password: string };
type DemoStatus = { enabled: boolean; demoLogins?: { user: Credentials; admin: Credentials } };

const DEMOS = [
  {
    key: "user",
    icon: LayoutDashboard,
    title: "Business dashboard",
    text: "Run the inbox, build a widget, launch campaigns and read analytics.",
  },
  {
    key: "admin",
    icon: ShieldCheck,
    title: "Platform admin",
    text: "Oversee every business, channel and message on the platform.",
  },
] as const;

function nextPath() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

async function signIn(credentials: Credentials) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error("Could not sign in. Please try again.");
  window.location.assign(nextPath());
}

export default function LoginPage() {
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Credentials>({ username: "", password: "" });

  const { data: status } = useQuery<DemoStatus>({
    queryKey: ["/api/sandbox/status"],
    queryFn: () => fetch("/api/sandbox/status").then((res) => res.json()),
  });

  const enter = async (key: string, credentials: Credentials) => {
    setPending(key);
    setError(null);
    try {
      await signIn(credentials);
    } catch (err) {
      setError((err as Error).message);
      setPending(null);
    }
  };

  const submitForm = (event: FormEvent) => {
    event.preventDefault();
    enter("form", form);
  };

  return (
    <main className="bf-home bf-login">
      <Link href="/" className="bf-logo">Botfizz</Link>

      {status?.enabled && status.demoLogins ? (
        <>
          <h1>Pick a demo to open</h1>
          <p className="bf-login__note">
            Botfizz is open source, so sign-up is closed. One click and you're in,
            with sample data ready to explore.
          </p>
          <div className="bf-login__cards">
            {DEMOS.map(({ key, icon: Icon, title, text }) => (
              <button
                key={key}
                type="button"
                disabled={!!pending}
                onClick={() => enter(key, status.demoLogins![key])}
              >
                {pending === key ? <Loader2 className="bf-spin" /> : <Icon />}
                <strong>{title}</strong>
                <span>{text}</span>
                <em>Open demo <ArrowRight size={15} /></em>
              </button>
            ))}
          </div>
        </>
      ) : (
        status && (
          <form className="bf-login__form" onSubmit={submitForm}>
            <h1>Sign in</h1>
            <input
              aria-label="Username or email"
              placeholder="Username or email"
              autoComplete="username"
              required
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
            <input
              aria-label="Password"
              placeholder="Password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <button type="submit" className="bf-button" disabled={!!pending}>
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )
      )}

      {error && <p className="bf-login__error" role="alert">{error}</p>}
      <Link href="/" className="bf-login__back">Back to home</Link>
    </main>
  );
}
