import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";
import type { components } from "@/lib/osmium/generated/schema";

const BUNDLE_KEY = ["osmium", "discord", "bundle"];

export function useDiscordBundle() {
    return useQuery({
        queryKey: BUNDLE_KEY,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/integrations/discord/configs");
            if (error) throw error;
            return data;
        },
    });
}

/**
 * Guilds the Discord bot is currently a member of, proxied live from the bot.
 * Used to populate the guild dropdown when configuring a Discord config.
 */
export function useDiscordGuilds() {
    return useQuery({
        queryKey: ["osmium", "discord", "guilds"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/integrations/discord/guilds");
            if (error) throw error;
            return data;
        },
        // The bot may be briefly offline (e.g. restarting) and osmium returns 503.
        // Retry a few times with backoff so the dropdown recovers on its own once
        // the bot is back, instead of sticking empty until a manual refresh.
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        staleTime: 60_000,
    });
}

/**
 * Live channels, categories, and roles for a guild, proxied from the bot, used
 * to populate channel/role/category selection dropdowns. Disabled until a
 * guild id is known.
 */
export function useDiscordGuildDiscovery(guildId: string | null | undefined) {
    return useQuery({
        queryKey: ["osmium", "discord", "discovery", guildId],
        enabled: !!guildId,
        queryFn: async () => {
            const { data, error } = await osmium.GET(
                "/api/v1/admin/integrations/discord/guilds/{guild_id}/discovery",
                { params: { path: { guild_id: guildId as string } } },
            );
            if (error) throw error;
            return data;
        },
        // See useDiscordGuilds: retry so a transient bot outage self-heals.
        retry: 3,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        staleTime: 60_000,
    });
}

const FEATURES_KEY = ["osmium", "discord", "features"];

export function useBotFeatures() {
    return useQuery({
        queryKey: FEATURES_KEY,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/integrations/discord/features");
            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateBotFeatures() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (features: Record<string, boolean>) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/integrations/discord/features", {
                body: { features },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: FEATURES_KEY }),
    });
}

function useInvalidateBundle() {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: BUNDLE_KEY });
}

export function useCreateDiscordConfig() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async (body: components["schemas"]["CreateDiscordConfigRequest"]) => {
            const { data, error } = await osmium.POST("/api/v1/admin/integrations/discord/configs", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useUpdateDiscordConfig() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async ({ configId, body }: {
            configId: string,
            body: components["schemas"]["UpdateDiscordConfigRequest"]
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/integrations/discord/configs/{config_id}", {
                params: { path: { config_id: configId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useDeleteDiscordConfig() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async (configId: string) => {
            const { data, error } = await osmium.DELETE("/api/v1/admin/integrations/discord/configs/{config_id}", {
                params: { path: { config_id: configId } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useCreateDiscordChannel() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async (body: components["schemas"]["CreateDiscordChannelRequest"]) => {
            const { data, error } = await osmium.POST("/api/v1/admin/integrations/discord/channels", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useUpdateDiscordChannel() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async ({ channelId, body }: {
            channelId: string,
            body: components["schemas"]["UpdateDiscordChannelRequest"]
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/integrations/discord/channels/{channel_id}", {
                params: { path: { channel_id: channelId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useDeleteDiscordChannel() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async (channelId: string) => {
            const { data, error } = await osmium.DELETE("/api/v1/admin/integrations/discord/channels/{channel_id}", {
                params: { path: { channel_id: channelId } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useCreateDiscordRole() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async (body: components["schemas"]["CreateDiscordRoleRequest"]) => {
            const { data, error } = await osmium.POST("/api/v1/admin/integrations/discord/roles", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useUpdateDiscordRole() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async ({ roleId, body }: {
            roleId: string,
            body: components["schemas"]["UpdateDiscordRoleRequest"]
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/integrations/discord/roles/{role_id}", {
                params: { path: { role_id: roleId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useDeleteDiscordRole() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async (roleId: string) => {
            const { data, error } = await osmium.DELETE("/api/v1/admin/integrations/discord/roles/{role_id}", {
                params: { path: { role_id: roleId } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useCreateDiscordCategory() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async (body: components["schemas"]["CreateDiscordCategoryRequest"]) => {
            const { data, error } = await osmium.POST("/api/v1/admin/integrations/discord/categories", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useUpdateDiscordCategory() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async ({ categoryId, body }: {
            categoryId: string,
            body: components["schemas"]["UpdateDiscordCategoryRequest"]
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/integrations/discord/categories/{category_id}", {
                params: { path: { category_id: categoryId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}

export function useDeleteDiscordCategory() {
    const invalidate = useInvalidateBundle();
    return useMutation({
        mutationFn: async (categoryId: string) => {
            const { data, error } = await osmium.DELETE("/api/v1/admin/integrations/discord/categories/{category_id}", {
                params: { path: { category_id: categoryId } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: invalidate,
    });
}
