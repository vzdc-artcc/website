import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

export function useMySuaRequests() {
    return useQuery({
        queryKey: ["osmium", "sua-requests", "me"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/sua/me", {
                params: { query: { page_size: 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useSuaMission(missionIdOrNumber: string) {
    return useQuery({
        queryKey: ["osmium", "sua-requests", "item", missionIdOrNumber],
        enabled: !!missionIdOrNumber,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/sua/{mission_id}", {
                params: { path: { mission_id: missionIdOrNumber } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useUpcomingSuaMissions() {
    return useQuery({
        queryKey: ["osmium", "sua-requests", "upcoming"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/sua/upcoming", {});
            if (error) throw error;
            return data;
        },
    });
}

interface CreateSuaRequestAirspace {
    identifier: string;
    bottom_altitude: string;
    top_altitude: string;
}

interface CreateSuaRequestInput {
    afiliation: string;
    start_at: string;
    end_at: string;
    details: string;
    airspace: CreateSuaRequestAirspace[];
}

export function useCreateSuaRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: CreateSuaRequestInput) => {
            const { data, error } = await osmium.POST("/api/v1/sua/me", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "sua-requests"] });
        },
    });
}

export function useDeleteSuaRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (missionId: string) => {
            const { data, error } = await osmium.DELETE("/api/v1/sua/{mission_id}", {
                params: { path: { mission_id: missionId } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "sua-requests"] });
        },
    });
}
