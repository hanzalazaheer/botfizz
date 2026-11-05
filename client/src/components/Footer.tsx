import React from "react";
import { Link } from "wouter";
import { MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AppSettings } from "@/types/types";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const { data: brandSettings } = useQuery<AppSettings>({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <footer className="bg-gray-950 text-white border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          <div className="flex flex-col items-start max-w-sm">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 mb-4">
              {brandSettings?.logo ? (
                <img
                  src={brandSettings.logo}
                  alt="Logo"
                  className="h-10 object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              ) : (
                <div className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-xl p-2.5">
                  <MessageSquare className="h-6 w-6" />
                </div>
              )}
            </Link>
            
            <p className="text-gray-400 text-sm leading-relaxed">
              AI chatbot builder for WhatsApp automation, Telegram, Instagram.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-8">
            <Link
              href="/about"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              About Us
            </Link>
            <Link
              href="/pricing"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy-policy"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/refund-policy"
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Refund Policy
            </Link>
          </div>

        </div>
      </div>

      <div className="border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <p className="text-gray-500 text-xs">
            © {currentYear} {brandSettings?.title || "Botfizz.com"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
