import { type QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";
import { OFFERS_KEY } from "@/lib/osmium/hooks/impromptu";

/**
 * Refreshes every cached response that carries a controller's membership
 * status or operating initials. osmium joins `org.memberships` into each of
 * these at read time, so any write to a controller's status leaves them all
 * stale.
 *
 * `refetchType: "all"` refetches cached queries that are not mounted too:
 * the status is changed from one page and read on others, and a plain
 * invalidation would let those pages render the old status from cache first.
 */
export function invalidateControllerStatusReaders(queryClient: QueryClient) {
    const keys = [
        ["osmium", "users"],
        ["osmium", "roster"],
        ["osmium", "training", "assignments"],
        ["osmium", "training", "assignment-requests"],
        ["osmium", "training", "release-requests"],
        ["osmium", "events", "positions"],
        OFFERS_KEY,
    ];
    for (const queryKey of keys) {
        queryClient.invalidateQueries({ queryKey, refetchType: "all" });
    }
}

interface PurgeCandidatesQuery {
    year: number;
    startMonth: number;
    endMonth: number;
}

export function usePurgeCandidates(query: PurgeCandidatesQuery) {
    return useQuery({
        queryKey: ["osmium", "roster", "purge-candidates", query.year, query.startMonth, query.endMonth],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/roster/purge-candidates", {
                params: {
                    query: {
                        year: query.year,
                        start_month: query.startMonth,
                        end_month: query.endMonth,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface ControllerLifecycleInput {
    cid: number;
    controllerStatus: "HOME" | "VISITOR" | "NONE";
    artcc?: string | null;
    cleanupOnNone?: boolean;
}

export function useUpdateControllerLifecycle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: ControllerLifecycleInput) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/users/{cid}/controller-lifecycle", {
                params: { path: { cid: input.cid } },
                body: {
                    controller_status: input.controllerStatus,
                    artcc: input.artcc ?? null,
                    cleanup_on_none: input.cleanupOnNone,
                },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            invalidateControllerStatusReaders(queryClient);
            // A move to NONE deletes the controller's LOAs.
            queryClient.invalidateQueries({ queryKey: ["osmium", "loas"] });
        },
    });
}
