import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

interface AdminBroadcastListQuery {
    page?: number;
    pageSize?: number;
    title?: string;
    exemptStaff?: boolean;
}

export function useAdminBroadcastList(query: AdminBroadcastListQuery = {}) {
    return useQuery({
        queryKey: ["osmium", "broadcasts", "admin-list", query.page, query.pageSize, query.title, query.exemptStaff],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/broadcasts", {
                params: {
                    query: {
                        page: query.page,
                        page_size: query.pageSize,
                        title: query.title,
                        exempt_staff: query.exemptStaff,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useAdminBroadcastDetail(broadcastId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "broadcasts", "admin-detail", broadcastId],
        enabled: !!broadcastId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/broadcasts/{broadcast_id}", {
                params: { path: { broadcast_id: broadcastId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface CreateBroadcastInput {
    title: string;
    description: string;
    file_id: string | null;
    exempt_staff: boolean;
    recipient_groups: string[];
}

export function useCreateBroadcast() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CreateBroadcastInput) => {
            const { data, error } = await osmium.POST("/api/v1/admin/broadcasts", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "broadcasts"] });
        },
    });
}

interface UpdateBroadcastInput {
    title: string;
    description: string;
    file_id: string | null;
    exempt_staff: boolean;
}

export function useUpdateBroadcast() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ broadcastId, body }: { broadcastId: string; body: UpdateBroadcastInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/broadcasts/{broadcast_id}", {
                params: { path: { broadcast_id: broadcastId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "broadcasts"] });
        },
    });
}

export function useDeleteBroadcast() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (broadcastId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/broadcasts/{broadcast_id}", {
                params: { path: { broadcast_id: broadcastId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "broadcasts"] });
        },
    });
}

export function useMyBroadcasts() {
    return useQuery({
        queryKey: ["osmium", "broadcasts", "me"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/broadcasts/me");
            if (error) throw error;
            return data;
        },
    });
}

export function useMarkBroadcastSeen() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (broadcastId: string) => {
            const { error } = await osmium.POST("/api/v1/broadcasts/{broadcast_id}/seen", {
                params: { path: { broadcast_id: broadcastId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "broadcasts", "me"] });
        },
    });
}

export function useMarkBroadcastAgreed() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (broadcastId: string) => {
            const { error } = await osmium.POST("/api/v1/broadcasts/{broadcast_id}/agree", {
                params: { path: { broadcast_id: broadcastId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "broadcasts", "me"] });
        },
    });
}
