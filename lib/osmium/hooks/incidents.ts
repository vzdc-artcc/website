import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

interface IncidentListQuery {
    closed?: boolean;
    reporterCid?: number;
    reporterName?: string;
    reporteeCid?: number;
    reporteeName?: string;
    page?: number;
    pageSize?: number;
}

export function useAdminIncidentList(query: IncidentListQuery = {}) {
    return useQuery({
        queryKey: [
            "osmium",
            "incidents",
            "admin-list",
            query.closed,
            query.reporterCid,
            query.reporterName,
            query.reporteeCid,
            query.reporteeName,
            query.page,
            query.pageSize,
        ],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/incidents", {
                params: {
                    query: {
                        closed: query.closed,
                        reporter_cid: query.reporterCid,
                        reporter_name: query.reporterName,
                        reportee_cid: query.reporteeCid,
                        reportee_name: query.reporteeName,
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

export function useIncidentItem(incidentId: string) {
    return useQuery({
        queryKey: ["osmium", "incidents", "item", incidentId],
        enabled: !!incidentId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/incidents/{incident_id}", {
                params: { path: { incident_id: incidentId } },
            });
            if (error) throw error;
            return data;
        },
    });
}

interface CreateIncidentInput {
    reportee_cid: number;
    timestamp: string;
    reason: string;
    reporter_callsign?: string | null;
    reportee_callsign: string;
}

export function useCreateIncident() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: CreateIncidentInput) => {
            const { data, error } = await osmium.POST("/api/v1/incidents", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "incidents"] });
        },
    });
}

export function useCloseIncident() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (incidentId: string) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/incidents/{incident_id}", {
                params: { path: { incident_id: incidentId } },
                body: { closed: true },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "incidents"] });
        },
    });
}
