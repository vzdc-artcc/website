import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

export function useMyLoas() {
    return useQuery({
        queryKey: ["osmium", "loas", "me"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/loa/me", {
                params: { query: { page_size: 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface AdminLoasQuery {
    cid?: number;
    status?: string;
    displayName?: string;
    page?: number;
    pageSize?: number;
}

export function useAdminLoas(query: AdminLoasQuery = {}) {
    return useQuery({
        queryKey: [
            "osmium",
            "loas",
            "admin-list",
            query.cid,
            query.status,
            query.displayName,
            query.page,
            query.pageSize,
        ],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/loa", {
                params: {
                    query: {
                        cid: query.cid,
                        status: query.status,
                        display_name: query.displayName,
                        page: query.page,
                        page_size: query.pageSize,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface LoaInput {
    start: string;
    end: string;
    reason: string;
}

export function useCreateLoa() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: LoaInput) => {
            const { data, error } = await osmium.POST("/api/v1/loa/me", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "loas"] });
        },
    });
}

export function useUpdateLoa() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ loaId, body }: { loaId: string; body: LoaInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/loa/{loa_id}", {
                params: { path: { loa_id: loaId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "loas"] });
        },
    });
}

export function useCancelLoa() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (loaId: string) => {
            const { data, error } = await osmium.POST("/api/v1/loa/{loa_id}/cancel", {
                params: { path: { loa_id: loaId } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "loas"] });
        },
    });
}

export function useDecideLoa() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ loaId, status }: { loaId: string; status: "APPROVED" | "DENIED" | "INACTIVE" }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/loa/{loa_id}/decision", {
                params: { path: { loa_id: loaId } },
                body: { status },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "loas"] });
        },
    });
}
