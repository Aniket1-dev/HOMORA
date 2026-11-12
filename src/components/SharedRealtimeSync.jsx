import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

/**
 * Keeps Discover current when Admin or Partner changes shared Postgres records.
 * Postgres RLS remains the authorization boundary for event delivery.
 */
export default function SharedRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel(`homora-discover-shared-data-${crypto.randomUUID()}`)
      .on("postgres_changes", { event: "*", schema: "public" }, (payload) => {
        // Existing pages use a mix of local state and query caches. Broadcast a
        // small in-tab event so stateful pages can reload the affected record.
        window.dispatchEvent(new CustomEvent("homora:realtime-change", { detail: payload }));
        queryClient.invalidateQueries({ refetchType: "active" });
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn(`HOMORA Discover Realtime connection issue: ${status}`);
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return null;
}
