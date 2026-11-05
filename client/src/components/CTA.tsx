import React from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const CTA: React.FC = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 border-t border-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          Ready to Build Your Chatbot?
        </h2>

        <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed">
          Join thousands of businesses using Botfizz.com to automate customer conversations and grow revenue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="bg-emerald-500 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-emerald-600 transition-all duration-300 shadow-md flex items-center group"
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="bg-gray-100 text-gray-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
