import React from "react";
import {
  MessageCircle,
  Users,
  Zap,
  Shield,
  BarChart3,
  Bot,
  Globe,
  GraduationCap,
  Heart,
  ArrowRight,
  CheckCircle,
  Mail,
} from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { AppSettings } from "@/types/types";

const AboutUs: React.FC = () => {
  const { data: brandSettings } = useQuery<AppSettings>({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  const features = [
    {
      icon: MessageCircle,
      title: "WhatsApp Marketing",
      description:
        "Send bulk campaigns, template messages, and personalized broadcasts to thousands of contacts directly via WhatsApp Cloud API.",
    },
    {
      icon: Bot,
      title: "AI Chatbot Builder",
      description:
        "Build intelligent, no-code chatbots that automatically respond to customer inquiries 24/7 with context-aware replies.",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description:
        "Track message delivery, open rates, campaign performance, and contact engagement with live dashboards.",
    },
    {
      icon: Users,
      title: "Contact Management",
      description:
        "Organize your audience with groups, tags, and smart segmentation to reach the right people at the right time.",
    },
    {
      icon: Zap,
      title: "Automation Flows",
      description:
        "Set up trigger-based automations that respond to messages, keywords, or events without manual effort.",
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description:
        "Built with enterprise-grade security. All data is encrypted and the platform is designed to be GDPR compliant.",
    },
  ];

  const team = [
    {
      name: "Hanzala Zaheer",
      role: "Co-Founder & Lead Developer",
      bio: "Computer Science student at the University of Gujrat. Hanzala led the backend architecture, WhatsApp API integration, and overall system design of Botfizz.",
      initials: "HZ",
      color: "from-emerald-500 to-teal-500",
    },
    {
      name: "Waleed Shams",
      role: "Co-Founder & Frontend Developer",
      bio: "Computer Science student at the University of Gujrat. Waleed designed and developed the frontend experience, UI/UX, and client-facing features of Botfizz.",
      initials: "WS",
      color: "from-blue-500 to-indigo-500",
    },
  ];

  const stats = [
    { value: "3", label: "Subscription Plans" },
    { value: "10+", label: "Features Built" },
    { value: "100%", label: "WhatsApp Cloud API" },
    { value: "24/7", label: "Automated Messaging" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-28 px-4">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full text-sm font-medium mb-10 border border-white/20">
            <GraduationCap className="w-4 h-4 mr-2 text-emerald-400" />
            University of Gujrat — Capstone Project 2025
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            About{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Botfizz
            </span>
          </h1>
          <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
            A WhatsApp marketing SaaS platform designed to help businesses connect with their customers at scale — built by two students with a big vision.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl font-extrabold text-emerald-600 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-emerald-100">
                <Heart className="w-4 h-4 mr-2" />
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Built to solve a real{" "}
                <span className="text-emerald-600">business problem</span>
              </h2>
              <p className="text-gray-600 mb-5 leading-relaxed text-lg">
                Botfizz was born as a capstone project at the <strong>University of Gujrat</strong> by two Computer Science students — Hanzala Zaheer and Waleed Shams. The idea came from observing how small businesses in Pakistan struggle to communicate with customers effectively.
              </p>
              <p className="text-gray-600 mb-5 leading-relaxed text-lg">
                WhatsApp is the dominant messaging platform in Pakistan and across South Asia, yet most businesses had no structured way to use it for marketing. Botfizz fills that gap — providing a complete WhatsApp marketing platform powered by the official Meta Cloud API.
              </p>
              <p className="text-gray-600 leading-relaxed text-lg">
                From bulk campaigns and AI chatbots to real-time analytics and automation flows, Botfizz is designed to give businesses of all sizes a professional WhatsApp presence without technical complexity.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-10 border border-emerald-100/50">
              <div className="bg-white rounded-2xl shadow-lg p-7 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Botfizz Platform</div>
                    <div className="text-xs text-gray-400">WhatsApp Marketing SaaS</div>
                  </div>
                </div>
                <ul className="space-y-3">
                  {[
                    "Meta WhatsApp Cloud API integration",
                    "AI-powered chatbot builder",
                    "Bulk campaign management",
                    "Real-time inbox & conversations",
                    "Contact groups & segmentation",
                    "Webhook automation flows",
                    "Multi-language support",
                    "Subscription-based billing",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-5 border border-emerald-100">
              <Users className="w-4 h-4 mr-2" />
              The Team
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet the Founders
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Two passionate developers from the University of Gujrat who turned a capstone project into a real SaaS product.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-lg transition-shadow"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white text-2xl font-extrabold mb-6 shadow-lg`}>
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <div className="text-sm text-emerald-600 font-medium mb-4">{member.role}</div>
                <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 px-5 py-3 rounded-full text-sm text-slate-600">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              University of Gujrat — BS Computer Science, Capstone Project 2025
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-5 border border-emerald-100">
              <Zap className="w-4 h-4 mr-2" />
              What We Built
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              A complete WhatsApp marketing toolkit
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Everything a business needs to use WhatsApp professionally — in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Globe className="w-14 h-14 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-5">Our Mission</h2>
          <p className="text-lg text-white/80 leading-relaxed mb-5">
            To democratize WhatsApp marketing — making it accessible, affordable, and effective for businesses of every size, especially in emerging markets like Pakistan where WhatsApp is the primary communication tool.
          </p>
          <p className="text-white/65 text-sm">
            We believe every business deserves a professional digital presence on the platform their customers already use daily.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to get started?</h2>
          <p className="text-gray-500 mb-8">
            Join Botfizz and start connecting with your customers on WhatsApp today. Free plan available — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors gap-2"
            >
              Start for Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="mailto:support@botfizz.com"
              className="inline-flex items-center justify-center border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors gap-2"
            >
              <Mail className="w-4 h-4" />
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
