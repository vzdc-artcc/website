import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

export function useMe(options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: ["osmium", "me"],
        retry: false,
        enabled: options?.enabled ?? true,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/me");
            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateMe() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: {
            preferred_name?: string | null,
            timezone?: string,
            bio?: string | null,
            receive_event_notifications?: boolean,
            operating_initials?: string,
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/me", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "me"] });
        },
    });
}

export function useRefreshMyVatusa() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data, error } = await osmium.POST("/api/v1/users/refresh-vatusa");
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "me"] });
        },
    });
}

export function useCreateMyTeamspeakUid() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (uid: string) => {
            const { data, error } = await osmium.POST("/api/v1/me/teamspeak-uids", {
                body: { uid },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "me"] });
        },
    });
}

export function useDeleteMyTeamspeakUid() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (identityId: string) => {
            const { error } = await osmium.DELETE("/api/v1/me/teamspeak-uids/{identity_id}", {
                params: { path: { identity_id: identityId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "me"] });
        },
    });
}
