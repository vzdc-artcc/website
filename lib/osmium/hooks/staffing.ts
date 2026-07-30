import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

export function useMyStaffingRequests() {
    return useQuery({
        queryKey: ["osmium", "staffing-requests", "me"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/staffing-requests/me", {});
            if (error) throw error;
            return data;
        },
    });
}

interface AdminStaffingRequestsQuery {
    cid?: number;
    displayName?: string;
    page?: number;
    pageSize?: number;
}

export function useAdminStaffingRequests(query: AdminStaffingRequestsQuery = {}) {
    return useQuery({
        queryKey: [
            "osmium",
            "staffing-requests",
            "admin-list",
            query.cid,
            query.displayName,
            query.page,
            query.pageSize,
        ],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/staffing-requests", {
                params: {
                    query: {
                        cid: query.cid,
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

interface CreateStaffingRequestInput {
    name: string;
    description: string;
}

export function useCreateStaffingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: CreateStaffingRequestInput) => {
            const { data, error } = await osmium.POST("/api/v1/staffing-requests/me", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "staffing-requests"] });
        },
    });
}

export function useDeleteStaffingRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (requestId: string) => {
            const { data, error } = await osmium.DELETE(
                "/api/v1/admin/staffing-requests/{request_id}",
                { params: { path: { request_id: requestId } } },
            );
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "staffing-requests"] });
        },
    });
}
