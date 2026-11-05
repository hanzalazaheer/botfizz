import React, { useState } from "react";
import { Check, Zap, Crown, Building, ArrowRight, MessageSquare, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import CheckoutModal from "@/components/modals/CheckoutPage";
import { Plan, PlansDataTypes } from "@/types/types";

const PLAN_ICONS: Record<string, React.ElementType> = {
  Free: Zap,
  Professional: Star,
  Enterprise: Building,
};

const PLAN_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  Free: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    badge: "bg-gray-100 text-gray-600",
  },
  Professional: {
    bg: "bg-emerald-600",
    text: "text-white",
    border: "border-emerald-600",
    badge: "bg-white/20 text-white",
  },
  Enterprise: {
    bg: "bg-slate-900",
    text: "text-white",
    border: "border-slate-900",
    badge: "bg-white/10 text-white",
  },
};

const FAQ = [
  {
    q: "Can I change my plan later?",
    a: "Yes. You can upgrade or downgrade your plan at any time from your account's Billing section. Changes take effect immediately.",
  },
  {
    q: "Is there a free trial?",
    a: "Our Free plan lets you explore Botfizz with no credit card required. You can upgrade to a paid plan when you're ready to scale.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept major credit/debit cards, and depending on your region, other payment gateways such as Razorpay, PayPal, Stripe, and Paystack.",
  },
  {
    q: "What happens if I cancel?",
    a: "You can cancel any time. Your subscription stays active until the end of the billing period, then reverts to the Free plan. Your data is retained for 30 days.",
  },
  {
    q: "Are Meta/WhatsApp API fees included?",
    a: "No. WhatsApp Business API conversation charges are billed separately by Meta. Botfizz subscription fees cover platform access only.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. We offer refunds within 7 days of purchase if you haven't used the service substantially. See our Refund Policy for full details.",
  },
];

const PricingPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const { data: plansData, isLoading } = useQuery<PlansDataTypes>({
    queryKey: ["/api/admin/plans"],
    queryFn: async () => {
      const res = await fetch("/api/admin/plans");
      return res.json();
    },
  });

  const plans: Plan[] = plansData?.data || [];

  const handleSelect = (plan: Plan) => {
    if (Number(isAnnual ? plan.annualPrice : plan.monthlyPrice) === 0) return;
    if (!isAuthenticated) {
      window.location.href = "/signup";
      return;
    }
    setSelectedPlan(plan);
    setCheckoutOpen(true);
  };

  const formatPrice = (plan: Plan) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    return Number(price) === 0 ? "Free" : `PKR ${Number(price).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-24 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center bg-white/10 px-5 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
            <MessageSquare className="w-4 h-4 mr-2 text-emerald-400" />
            Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-5 tracking-tight">
            Choose the plan that{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              fits your business
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto mb-10">
            Start free and scale as you grow. No hidden fees, no surprises. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center bg-white/10 rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                !isAnnual ? "bg-white text-slate-900 shadow" : "text-white/70 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isAnnual ? "bg-white text-slate-900 shadow" : "text-white/70 hover:text-white"
              }`}
            >
              Annual
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.Free;
                const Icon = PLAN_ICONS[plan.name] || Zap;
                const isFeatured = plan.name === "Professional";
                const isFree = Number(isAnnual ? plan.annualPrice : plan.monthlyPrice) === 0;
                const features = (plan.permissions as any) || [];
                const featureList: string[] = Array.isArray(features)
                  ? features.map((f: any) => (typeof f === "string" ? f : f.label || f.name || ""))
                  : [];

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl border-2 overflow-hidden transition-transform hover:-translate-y-1 ${
                      isFeatured ? "border-emerald-500 shadow-2xl shadow-emerald-500/20 scale-105" : "border-gray-200 shadow-lg"
                    }`}
                  >
                    {isFeatured && (
                      <div className="bg-emerald-500 text-white text-xs font-bold text-center py-2 tracking-wider uppercase">
                        Most Popular
                      </div>
                    )}

                    <div className={`p-8 ${isFeatured ? "bg-emerald-600" : plan.name === "Enterprise" ? "bg-slate-900" : "bg-white"}`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isFeatured || plan.name === "Enterprise" ? "bg-white/15" : "bg-emerald-50"}`}>
                          <Icon className={`w-6 h-6 ${isFeatured || plan.name === "Enterprise" ? "text-white" : "text-emerald-600"}`} />
                        </div>
                        {plan.badge && (
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isFeatured || plan.name === "Enterprise" ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"}`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <h3 className={`text-2xl font-bold mb-2 ${isFeatured || plan.name === "Enterprise" ? "text-white" : "text-gray-900"}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-sm mb-6 leading-relaxed ${isFeatured || plan.name === "Enterprise" ? "text-white/70" : "text-gray-500"}`}>
                        {plan.description}
                      </p>

                      <div className="mb-8">
                        <span className={`text-4xl font-extrabold ${isFeatured || plan.name === "Enterprise" ? "text-white" : "text-gray-900"}`}>
                          {formatPrice(plan)}
                        </span>
                        {!isFree && (
                          <span className={`text-sm ml-1 ${isFeatured || plan.name === "Enterprise" ? "text-white/60" : "text-gray-400"}`}>
                            /{isAnnual ? "year" : "month"}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleSelect(plan)}
                        className={`w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                          isFeatured
                            ? "bg-white text-emerald-700 hover:bg-emerald-50"
                            : plan.name === "Enterprise"
                            ? "bg-emerald-600 text-white hover:bg-emerald-500"
                            : isFree
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {isFree ? "Get Started Free" : "Subscribe Now"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {featureList.length > 0 && (
                      <div className="bg-white p-8 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">What's included</p>
                        <ul className="space-y-3">
                          {featureList.slice(0, 8).map((feat, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                              <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              {feat}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Feature comparison note */}
      <section className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
            <p className="text-emerald-800 text-sm">
              All plans include access to the Botfizz dashboard, WhatsApp Cloud API integration, and real-time webhook support.{" "}
              <Link href="/about" className="font-semibold underline underline-offset-2">Learn more about Botfizz</Link>
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-center mb-10">Everything you need to know about our pricing.</p>

          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-gray-500 text-sm mb-3">Have more questions?</p>
            <a
              href="mailto:support@botfizz.com"
              className="inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors gap-2"
            >
              Contact Support
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {checkoutOpen && selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          isAnnual={isAnnual}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </div>
  );
};

export default PricingPage;
