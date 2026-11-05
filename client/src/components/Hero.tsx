import React from "react";
import { Link } from "wouter";
import { ArrowRight, Bot } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50/50 to-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-100/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-emerald-50/40 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-4xl mx-auto relative text-center">
        <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-8 border border-emerald-100">
          <Bot className="w-4 h-4 mr-2" />
          Free Chatbot Builder
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
          The Ultimate AI Chatbot Builder
          <br />
          <span className="text-emerald-500">Botfizz.com</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Build, customize, and deploy smart AI chatbots and website widgets for
          WhatsApp, Instagram, and Telegram
        </p>

        <div className="flex justify-center items-center">
          <Link
            href="/signup"
            className="bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 flex items-center group"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
