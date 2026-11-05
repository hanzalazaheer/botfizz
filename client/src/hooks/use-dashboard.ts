/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * Project: University of Gujrat Capstone Project
 * Website: https://botfizz.com
 * Contact: support@botfizz.com
 * ============================================================
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { DashboardStarApiDataType } from "@/pages/types/type";

export function useDashboardStats(channelId?: string, userId?: string) {
  return useQuery<DashboardStarApiDataType>({
    queryKey: ["/api/dashboard/stats", channelId, userId],
    queryFn: async () => {
      if (!channelId) {
        // Return default stats if no channel is selected
        return {
          totalContacts: 0,
          todayContacts: 0,
          weekContacts: 0,
          lastWeekContacts: 0,
          totalCampaigns: 0,
          totalTemplates: 0,
          messagesSent: 0,
          messagesDelivered: 0,
          messagesFailed: 0,
          messagesRead: 0,
          totalMessages: 0,
          todayMessages: 0,
          thisMonthMessages: 0,
          lastMonthMessages: 0,
        };
      }

      const response = await fetch(`/api/dashboard/stats?channelId=${channelId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard stats");
      }
      return response.json();
    },
    enabled: true,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useAnalytics(days: number = 7, channelId?: string) {
  return useQuery({
    queryKey: ["/api/analytics", days, channelId],
    queryFn: async () => {
      if (!channelId) {
        // Return empty data if no channel is selected
        return [];
      }

      const response = await fetch(
        `/api/analytics?days=${days}&channelId=${channelId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data");
      }
      return response.json();
    },
    enabled: true,
  });
}
