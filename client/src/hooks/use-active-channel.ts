/**
 * Tenant-scoped active WhatsApp channel.
 * Query key includes the authenticated user id so React Query never
 * serves another user's cached channel after login/logout or account switch.
 */
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

export function useActiveChannel() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["/api/channels/active", user?.id ?? ""],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await fetch("/api/channels/active", {
        credentials: "include",
      });
      if (res.status === 404 || res.status === 204) return null;
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || `Failed to load active channel (${res.status})`);
      }
      const data = await res.json();
      return data as any;
    },
    staleTime: 30_000,
    retry: false,
  });
}
