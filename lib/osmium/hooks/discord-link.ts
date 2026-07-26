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
        mutationFn: async (redirectUri?: string) => {
            const { data, error } = await osmium.POST("/api/v1/me/discord/link/start", {
                body: { redirect_uri: redirectUri },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCompleteDiscordLink() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: { code: string, state: string, redirectUri?: string }) => {
            const { data, error } = await osmium.POST("/api/v1/me/discord/link/complete", {
                body: { code: body.code, state: body.state, redirect_uri: body.redirectUri },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LINK_KEY });
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
