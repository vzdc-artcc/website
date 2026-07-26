import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

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
            queryClient.invalidateQueries({ queryKey: ["osmium", "roster"] });
        },
    });
}
