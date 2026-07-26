import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";
import { buildPermissionTree, flattenPermissionTree, type PermissionTree } from "@/lib/osmium/hooks/access";

const LIST_KEY = ["osmium", "api-keys"];

export function useApiKeys(pageSize = 50) {
    return useQuery({
        queryKey: [...LIST_KEY, pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/api-keys", {
                params: { query: { page_size: pageSize } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useApiKey(keyId: string) {
    return useQuery({
        queryKey: ["osmium", "api-keys", keyId],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/api-keys/{key_id}", {
                params: { path: { key_id: keyId } },
            });
            if (error || !data) throw error ?? new Error("no api key returned");
            return {
                ...data,
                permissions: flattenPermissionTree((data.permissions ?? {}) as PermissionTree),
            };
        },
        enabled: !!keyId,
    });
}

export function useCreateApiKey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({name, description, expiresAt, permissions}: {
            name: string,
            description?: string,
            expiresAt?: string,
            permissions: string[],
        }) => {
            const { data, error } = await osmium.POST("/api/v1/api-keys", {
                body: {
                    name,
                    description: description || undefined,
                    expires_at: expiresAt || undefined,
                    permissions: buildPermissionTree(permissions),
                },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LIST_KEY });
        },
    });
}

export function useUpdateApiKey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({keyId, name, description, permissions}: {
            keyId: string,
            name?: string,
            description?: string,
            permissions?: string[],
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/api-keys/{key_id}", {
                params: { path: { key_id: keyId } },
                body: {
                    name,
                    description,
                    permissions: permissions ? buildPermissionTree(permissions) : undefined,
                },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: LIST_KEY });
            queryClient.invalidateQueries({ queryKey: ["osmium", "api-keys", variables.keyId] });
        },
    });
}

export function useRevokeApiKey() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (keyId: string) => {
            const { error } = await osmium.DELETE("/api/v1/api-keys/{key_id}", {
                params: { path: { key_id: keyId } },
            });
            if (error) throw error;
        },
        onSuccess: (_data, keyId) => {
            queryClient.invalidateQueries({ queryKey: LIST_KEY });
            queryClient.invalidateQueries({ queryKey: ["osmium", "api-keys", keyId] });
        },
    });
}
