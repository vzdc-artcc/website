import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

const LINK_KEY = ["osmium", "me", "discord"];

export function useMyDiscordLink() {
    return useQuery({
        queryKey: LINK_KEY,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/me/discord");
            if (error) throw error;
            return data;
        },
    });
}

export function useStartDiscordLink() {
    return useMutation({
        mutationFn: async (returnUrl?: string) => {
            const { data, error } = await osmium.POST("/api/v1/me/discord/link/start", {
                body: { return_url: returnUrl },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useUnlinkDiscord() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data, error } = await osmium.POST("/api/v1/me/discord/unlink", {
                body: {},
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LINK_KEY });
        },
    });
}
