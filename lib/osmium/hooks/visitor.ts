import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

export function useMyVisitorApplication() {
    return useQuery({
        queryKey: ["osmium", "visitor-applications", "me"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/visitor-application", {});
            if (error) throw error;
            return data;
        },
    });
}

interface AdminVisitorApplicationsQuery {
    cid?: number;
    status?: string;
    displayName?: string;
    homeFacility?: string;
    page?: number;
    pageSize?: number;
}

export function useAdminVisitorApplications(query: AdminVisitorApplicationsQuery = {}) {
    return useQuery({
        queryKey: [
            "osmium",
            "visitor-applications",
            "admin-list",
            query.cid,
            query.status,
            query.displayName,
            query.homeFacility,
            query.page,
            query.pageSize,
        ],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/visitor-applications", {
                params: {
                    query: {
                        cid: query.cid,
                        status: query.status,
                        display_name: query.displayName,
                        home_facility: query.homeFacility,
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

interface CreateVisitorApplicationInput {
    home_facility: string;
    why_visit: string;
}

export function useCreateVisitorApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: CreateVisitorApplicationInput) => {
            const { data, error } = await osmium.POST("/api/v1/users/visitor-application", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "visitor-applications"] });
        },
    });
}

export function useDecideVisitorApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            applicationId,
            status,
            reasonForDenial,
        }: {
            applicationId: string;
            status: "APPROVED" | "DENIED";
            reasonForDenial?: string;
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/visitor-applications/{application_id}", {
                params: { path: { application_id: applicationId } },
                body: { status, reason_for_denial: reasonForDenial },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "visitor-applications"] });
        },
    });
}
