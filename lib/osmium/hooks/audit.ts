import { useQuery } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

interface AuditLogsQuery {
    resourceType?: string;
    pageSize?: number;
    page?: number;
}

export function useAuditLogs(query: AuditLogsQuery = {}) {
    return useQuery({
        queryKey: ["osmium", "audit", query.resourceType, query.pageSize, query.page],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/audit", {
                params: {
                    query: {
                        resource_type: query.resourceType,
                        page_size: query.pageSize ?? 50,
                        page: query.page,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}
