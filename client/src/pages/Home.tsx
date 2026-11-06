/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * ============================================================
 */

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "wouter";
import { ArrowRight, Award, Calendar, Code2, MapPin, Mic2, Users } from "lucide-react";
import GlobeScene from "@/components/landing/GlobeScene";
import { useAuth } from "@/contexts/auth-context";
import { REPO_URL } from "@/lib/links";
import "./home.css";

const FEATURES = [
  {
    id: "inbox",
    tag: "Team Inbox",
    title: "Every chat in one shared inbox",
    text: "See who's waiting, assign the conversation and reply together. Messages update live, so nobody answers twice.",
    points: ["Live conversations", "Assignment and status", "Unread tracking"],
    href: "/inbox",
  },
  {
    id: "widget",
    tag: "Widget Builder",
    title: "Design a chat widget for any website",
    text: "Pick colours, write a greeting and watch the preview change as you type. Paste one snippet and it's live.",
    points: ["Live preview", "Full branding", "One-line install"],
    href: "/widget-builder",
  },
  {
    id: "automation",
    tag: "Flow Builder",
    title: "Build automations on a visual canvas",
    text: "Drag together triggers, questions and conditions. Routine questions get answered before your team even looks.",
    points: ["Drag and drop", "Triggers and conditions", "No code"],
    href: "/automation",
  },
  {
    id: "campaigns",
    tag: "Campaigns",
    title: "Launch a campaign in minutes",
    text: "Choose an audience and a template, then send now or schedule it. Delivery and reads are tracked as they happen.",
    points: ["Audience targeting", "Scheduling", "Live delivery stats"],
    href: "/campaigns",
  },
  {
    id: "templates",
    tag: "Templates",
    title: "Write once, reuse everywhere",
    text: "Keep reusable messages with variables, buttons and media in one organised library.",
    points: ["Variables", "Buttons and media", "Approval status"],
    href: "/templates",
  },
  {
    id: "contacts",
    tag: "Contacts",
    title: "Know exactly who you're talking to",
    text: "Search, tag and group your customers, or bring in thousands at once from a spreadsheet.",
    points: ["Groups and tags", "Bulk import", "Instant search"],
    href: "/contacts",
  },
  {
    id: "analytics",
    tag: "Analytics",
    title: "See what's actually working",
    text: "Follow every message from sent to read, compare campaigns and export the numbers.",
    points: ["Delivery funnel", "Campaign reports", "Export"],
    href: "/analytics",
  },
];

const MORE = [
  ["Roles and teams", "Invite teammates with permissions for each part of the product."],
  ["Multi-channel", "Run several numbers and websites from one account."],
  ["REST API and webhooks", "Connect your own systems with documented endpoints."],
  ["8 languages", "Interface translations, including right-to-left Arabic."],
  ["Admin console", "Manage every business, channel and message log on the platform."],
  ["Real-time core", "Socket-driven updates across the inbox and dashboards."],
];

const FACTS = [
  ["52", "database models"],
  ["30+", "API modules"],
  ["8", "languages"],
  ["1", "international stage"],
];

const JOURNEY = [
  {
    icon: Code2,
    title: "Capstone at the University of Gujrat",
    text: "Designed and built as our final year project, from database to interface.",
  },
  {
    icon: Mic2,
    title: "Venture-Z Startup Competition",
    text: "Taken from campus to an international startup competition at ICSDI 2026.",
  },
  {
    icon: Award,
    title: "Certified contribution",
    text: "Recognised by ICSDI 2026 for a valuable contribution to the competition.",
  },
];

const STACK = ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Drizzle ORM", "Socket.IO", "Tailwind CSS", "Vite", "WebGL"];

function FeatureVideo({ id, active }: { id: string; active: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (active) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  return (
    <video
      ref={videoRef}
      className={active ? "is-active" : ""}
      src={`/showcase/${id}.mp4`}
      poster={`/showcase/${id}.webp`}
      muted
      loop
      playsInline
      preload={active ? "auto" : "none"}
      aria-hidden="true"
    />
  );
}

function FeatureStory({ tryHref }: { tryHref: (href: string) => string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const box = sectionRef.current!.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      if (travel <= 0) return;
      const progress = Math.min(Math.max(-box.top / travel, 0), 0.999);
      const position = progress * FEATURES.length;
      setActive(Math.floor(position));
      // The frame swings a little within each feature, keeping the page feeling 3D.
      const swing = (position % 1) - 0.5;
      frameRef.current!.style.setProperty("--swing", String(swing));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const feature = FEATURES[active];

  return (
    <section
      className="bf-story"
      id="features"
      ref={sectionRef}
      style={{ "--count": FEATURES.length } as React.CSSProperties}
    >
      <div className="bf-story__pin">
        <div className="bf-story__copy" key={feature.id}>
          <p className="bf-eyebrow">
            {String(active + 1).padStart(2, "0")} / {String(FEATURES.length).padStart(2, "0")} · {feature.tag}
          </p>
          <h2>{feature.title}</h2>
          <p className="bf-story__text">{feature.text}</p>
          <ul>
            {feature.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
          <Link href={tryHref(feature.href)} className="bf-button">
            Try {feature.tag} live <ArrowRight size={18} />
          </Link>
        </div>

        <div className="bf-story__stage">
          <div className="bf-frame" ref={frameRef}>
            <div className="bf-frame__bar"><i /><i /><i /><span>{feature.tag}</span></div>
            <div className="bf-frame__screen">
              {FEATURES.map((item, index) => (
                <FeatureVideo key={item.id} id={item.id} active={index === active} />
              ))}
            </div>
          </div>
          <div className="bf-story__dots" aria-hidden="true">
            {FEATURES.map((item, index) => (
              <i key={item.id} className={index === active ? "is-active" : ""} />
            ))}
          </div>
        </div>
      </div>

      {/* Small screens read the features as a simple list. */}
      <div className="bf-story__list">
        {FEATURES.map((item) => (
          <article key={item.id}>
            <p className="bf-eyebrow">{item.tag}</p>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <video src={`/showcase/${item.id}.mp4`} poster={`/showcase/${item.id}.webp`} muted loop autoPlay playsInline preload="none" aria-hidden="true" />
            <Link href={tryHref(item.href)} className="bf-button">
              Try it live <ArrowRight size={18} />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function Certificate() {
  const onMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--ry", `${((event.clientX - box.left) / box.width - 0.5) * 12}deg`);
    event.currentTarget.style.setProperty("--rx", `${(0.5 - (event.clientY - box.top) / box.height) * 12}deg`);
  };
  const onLeave = (event: PointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.setProperty("--ry", "0deg");
    event.currentTarget.style.setProperty("--rx", "0deg");
  };

  return (
    <a
      className="bf-certificate"
      href="/showcase/certificate.jpg"
      target="_blank"
      rel="noreferrer"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <img
        src="/showcase/certificate.jpg"
        alt="ICSDI 2026 certificate awarded to Hanzala Zaheer, Team Lead of BotFizz, for the Venture-Z Startup Competition"
        loading="lazy"
        width={1251}
        height={788}
      />
    </a>
  );
}

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [showBar, setShowBar] = useState(false);

  const tryHref = (href: string) =>
    isAuthenticated ? href : `/login?next=${encodeURIComponent(href)}`;
  const demoHref = isAuthenticated ? "/dashboard" : "/login";

  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bf-home">
      <GlobeScene />

      <nav className="bf-nav" aria-label="Main">
        <Link href="/" className="bf-logo">Botfizz</Link>
        <div>
          <a href="#features">Features</a>
          <a href="#recognition">Recognition</a>
          <a href="#team">Team</a>
          {REPO_URL && <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>}
          <Link href={demoHref} className="bf-nav__cta">Open live demo</Link>
        </div>
      </nav>

      <header className="bf-hero">
        <p className="bf-eyebrow">Final year project · University of Gujrat</p>
        <h1>
          Every customer conversation. <em>One platform.</em>
        </h1>
        <p className="bf-hero__lead">
          Botfizz brings a team inbox, chatbot builder, website widget, campaigns
          and analytics together. Built by two students, and taken all the way to
          an international startup competition in Riyadh.
        </p>
        <div className="bf-actions">
          <Link href={demoHref} className="bf-button bf-button--large">
            Open the live demo <ArrowRight size={20} />
          </Link>
          <a href="#features" className="bf-button bf-button--ghost">See the features</a>
        </div>
        <p className="bf-hero__hint">No sign-up. One click, and the full dashboard is yours to explore.</p>
      </header>

      <section className="bf-proof" aria-label="Recognition">
        <Award size={18} />
        <span>Venture-Z Startup Competition</span>
        <i />
        <span>ICSDI 2026</span>
        <i />
        <span>Prince Sultan University, Riyadh</span>
      </section>

      <section className="bf-facts" aria-label="Project in numbers">
        {FACTS.map(([value, label]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <FeatureStory tryHref={tryHref} />

      <section className="bf-features">
        <p className="bf-eyebrow">And there's more</p>
        <h2>Built like a real product.</h2>
        <div className="bf-grid">
          {MORE.map(([title, text]) => (
            <article className="bf-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bf-midcta">
        <h2>Reading about it is the slow way.</h2>
        <Link href={demoHref} className="bf-button bf-button--large">
          Open the dashboard <ArrowRight size={20} />
        </Link>
      </section>

      <section className="bf-recognition" id="recognition">
        <div>
          <p className="bf-eyebrow">Recognition and exposure</p>
          <h2>From a final year project to an international stage.</h2>
          <ul className="bf-meta">
            <li><Mic2 size={18} /> Venture-Z Startup Competition</li>
            <li><Award size={18} /> 3rd International Conference on Sustainability: Developments and Innovations (ICSDI 2026)</li>
            <li><MapPin size={18} /> Prince Sultan University, Riyadh, Saudi Arabia</li>
            <li><Calendar size={18} /> 8–12 February 2026</li>
            <li><Users size={18} /> Hanzala Zaheer, Team Lead of BotFizz</li>
          </ul>
        </div>
        <Certificate />
      </section>

      <section className="bf-journey">
        <p className="bf-eyebrow">The journey</p>
        <ol>
          {JOURNEY.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <Icon size={22} />
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bf-team" id="team">
        <p className="bf-eyebrow">The team</p>
        <h2>Two developers. One capstone.</h2>
        <div className="bf-team__people">
          <article>
            <span aria-hidden="true">HZ</span>
            <h3>Hanzala Zaheer</h3>
            <p>Team Lead and Developer</p>
          </article>
          <article>
            <span aria-hidden="true">WS</span>
            <h3>Waleed Shams</h3>
            <p>Developer</p>
          </article>
        </div>
        <p className="bf-team__note">University of Gujrat. Designed and developed end to end, and open source.</p>
        <ul className="bf-stack-list" aria-label="Technology">
          {STACK.map((name) => <li key={name}>{name}</li>)}
        </ul>
      </section>

      <section className="bf-final">
        <h2>Now see it running.</h2>
        <Link href={demoHref} className="bf-button bf-button--large">
          Open the live demo <ArrowRight size={20} />
        </Link>
        {REPO_URL && (
          <a href={REPO_URL} target="_blank" rel="noreferrer" className="bf-final__repo">
            Or read the source code on GitHub
          </a>
        )}
      </section>

      <footer className="bf-footer">
        <span>© {new Date().getFullYear()} Botfizz · Hanzala Zaheer and Waleed Shams</span>
        <span>University of Gujrat capstone project</span>
      </footer>

      <Link href={demoHref} className={`bf-stickybar${showBar ? " is-visible" : ""}`} tabIndex={showBar ? 0 : -1}>
        <span>Everything here is live.</span>
        <strong>Open the demo <ArrowRight size={16} /></strong>
      </Link>
    </div>
  );
};

export default Home;
