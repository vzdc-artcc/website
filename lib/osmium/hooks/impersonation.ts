import { useMutation } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

/**
 * Authenticated user impersonation (osmium spec 012). Starting/stopping flips the
 * effective user on the single session cookie, so every cached query is now for a
 * different identity — we do a full navigation to reset all client state cleanly
 * rather than trying to selectively invalidate.
 */

export function useStartImpersonation() {
    return useMutation({
        mutationFn: async ({ cid, reason }: { cid: number; reason?: string }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/impersonate/{cid}", {
                params: { path: { cid } },
                body: { reason: reason?.trim() ? reason.trim() : null },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Now acting as the target — reset everything and land on their home.
            window.location.assign("/");
        },
    });
}

export function useStopImpersonation() {
    return useMutation({
        mutationFn: async () => {
            const { data, error } = await osmium.POST("/api/v1/admin/impersonate/stop");
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            // Restored to the admin — reset everything.
            window.location.assign("/");
        },
    });
}
