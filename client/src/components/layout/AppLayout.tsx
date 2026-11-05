/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { setMeta } from "@/hooks/setMeta";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { useSocket } from "@/contexts/socket-context";
import { useGlobalNotifications } from "../notification/useGlobalNotifications.tsx";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: brandSettings } = useQuery({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });


 const { socket } = useSocket();

  const { data: unreadData } = useQuery({
    queryKey: ["/api/conversations/unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/conversations/unread-count");
      return res.json();
    },
    staleTime: 30 * 1000,
  });

  useGlobalNotifications(socket, unreadData?.count ?? 0);

  useEffect(() => {
    if (brandSettings) {
      setMeta({
        title: brandSettings.title,
        favicon: brandSettings.favicon,
        description: brandSettings.tagline,
        keywords: `${brandSettings.title} ${brandSettings.tagline}`,
      });
    }
  }, [brandSettings]);

  return (
    <>
      <SidebarProvider>{children}</SidebarProvider>
    </>
  );
}
