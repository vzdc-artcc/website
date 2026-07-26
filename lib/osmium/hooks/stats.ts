import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

interface ArtccStatsQuery {
    year?: number;
    month?: number;
    allTime?: boolean;
    top?: number;
    limit?: number;
}

/** Controllers currently connected on an ARTCC position (homepage "Online ATC"). */
export function useOnlineControllers() {
    return useQuery({
        queryKey: ["osmium", "stats", "online"],
        refetchInterval: 60_000,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/stats/online");
            if (error) throw error;
            return data;
        },
    });
}

export function useArtccStats(query: ArtccStatsQuery = {}) {
    return useQuery({
        queryKey: ["osmium", "stats", "artcc", query.year, query.month, query.allTime, query.top, query.limit],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/stats/artcc", {
                params: {
                    query: {
                        year: query.year,
                        month: query.month,
                        all_time: query.allTime,
                        top: query.top,
                        limit: query.limit,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useControllerHistory(cid: number, year?: number) {
    return useQuery({
        queryKey: ["osmium", "stats", "controller-history", cid, year],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/stats/controller/{cid}/history", {
                params: {
                    path: { cid },
                    query: { year },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useControllerTotals(cid: number, options: { since?: string; until?: string } = {}) {
    return useQuery({
        queryKey: ["osmium", "stats", "controller-totals", cid, options.since, options.until],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/stats/controller/{cid}/totals", {
                params: { path: { cid }, query: { since: options.since, until: options.until } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useControllerPositions(cid: number, options: { year?: number; month?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "stats", "controller-positions", cid, options.year, options.month],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/stats/controller/{cid}/positions", {
                params: {
                    path: { cid },
                    query: { year: options.year, month: options.month, page_size: 500 },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useStatisticsPrefixes() {
    return useQuery({
        queryKey: ["osmium", "stats", "prefixes"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/stats/prefixes");
            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateStatisticsPrefixes() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (prefixes: string[]) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/stats/prefixes", {
                body: { prefixes },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["osmium", "stats", "prefixes"], data);
        },
    });
}
