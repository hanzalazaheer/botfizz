import React from "react";
import { Shield, RefreshCw, AlertCircle, CheckCircle, Mail, Clock } from "lucide-react";

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
            <Shield className="w-4 h-4 mr-2 text-emerald-400" />
            Refund & Cancellation Policy
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 tracking-tight">
            Our Refund Policy
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            We stand behind our service. Read our fair and transparent refund policy below.
          </p>
          <p className="text-sm text-white/50 mt-4">Last updated: May 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">7-Day Window</h3>
              <p className="text-sm text-gray-500">Request a refund within 7 days of purchase</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Easy Process</h3>
              <p className="text-sm text-gray-500">Simple email request — no complicated forms</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Fast Resolution</h3>
              <p className="text-sm text-gray-500">We process refund requests within 5 business days</p>
            </div>
          </div>

          {/* Main content */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 md:p-12 space-y-10">

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">1</span>
                  Overview
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  At Botfizz, we are committed to providing a high-quality WhatsApp marketing platform. If you are not satisfied with your subscription, we offer a refund under the conditions described below. This policy applies to all paid plans on botfizz.com.
                </p>
              </section>

              <div className="border-t border-gray-100" />

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">2</span>
                  Eligibility for Refunds
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">You are eligible for a full refund if:</p>
                <ul className="space-y-3">
                  {[
                    "You request a refund within 7 calendar days of the original purchase date.",
                    "You have not used the platform to send more than 100 messages during the subscription period.",
                    "Your account is in good standing and has not violated our Terms of Service.",
                    "The refund request is for your most recent charge only (not for prior billing periods).",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="border-t border-gray-100" />

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-100 text-red-700 rounded-lg flex items-center justify-center text-sm font-bold">3</span>
                  Non-Refundable Cases
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">Refunds will <strong>not</strong> be issued in the following situations:</p>
                <ul className="space-y-3">
                  {[
                    "Refund request is made more than 7 days after the billing date.",
                    "The account has been used substantially (more than 100 messages sent).",
                    "The subscription has been downgraded or cancelled by the user mid-cycle.",
                    "Violations of our Terms of Service or Acceptable Use Policy have occurred.",
                    "Charges related to WhatsApp Business API fees (Meta/Facebook fees are non-refundable by us).",
                    "Free plan — the Free plan has no charges and therefore no refunds apply.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="border-t border-gray-100" />

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">4</span>
                  How to Request a Refund
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To request a refund, follow these steps:
                </p>
                <ol className="space-y-4">
                  {[
                    { step: "Email us", desc: "Send an email to support@botfizz.com with the subject line: \"Refund Request — [Your Account Email]\"." },
                    { step: "Include details", desc: "Provide your registered email address, the date of purchase, your plan name, and the reason for the refund request." },
                    { step: "Wait for confirmation", desc: "Our team will review your request and respond within 2 business days." },
                    { step: "Receive your refund", desc: "Approved refunds are processed within 5 business days to your original payment method." },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 bg-gray-50 rounded-xl p-4">
                      <span className="w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                      <div>
                        <span className="font-semibold text-gray-900">{item.step}: </span>
                        <span className="text-gray-600">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="border-t border-gray-100" />

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">5</span>
                  Cancellations
                </h2>
                <p className="text-gray-600 leading-relaxed mb-3">
                  You can cancel your subscription at any time from your account's Billing settings. Upon cancellation:
                </p>
                <ul className="space-y-3">
                  {[
                    "Your subscription will remain active until the end of the current billing period.",
                    "You will not be charged for the next billing cycle.",
                    "Cancellation does not automatically trigger a refund for the current period.",
                    "All your data will be retained for 30 days after cancellation and then permanently deleted.",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="border-t border-gray-100" />

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">6</span>
                  Annual Subscriptions
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  For annual plan subscribers, refund requests must be made within 7 days of the annual charge. After 7 days, we may offer a pro-rated credit toward a future subscription period at our discretion, but cash refunds will not be issued for the remaining unused months.
                </p>
              </section>

              <div className="border-t border-gray-100" />

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-sm font-bold">7</span>
                  Changes to This Policy
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Botfizz reserves the right to update this Refund Policy at any time. Changes will be posted on this page with a revised "Last Updated" date. Continued use of our platform after changes constitutes acceptance of the updated policy.
                </p>
              </section>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="mt-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center">
            <Mail className="w-10 h-10 mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
            <p className="text-white/75 mb-5">Our support team is happy to help you with any refund-related questions.</p>
            <a
              href="mailto:support@botfizz.com"
              className="inline-flex items-center bg-white text-emerald-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-emerald-50 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              support@botfizz.com
            </a>
          </div>

        </div>
      </section>
    </div>
  );
};

export default RefundPolicy;
