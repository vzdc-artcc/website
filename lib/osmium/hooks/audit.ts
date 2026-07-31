import { useQuery } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

interface AuditLogsQuery {
    resourceType?: string;
    /** Domain allow-list; sent to osmium as a comma-separated `resource_types`. */
    resourceTypes?: string[];
    pageSize?: number;
    page?: number;
}

export function useAuditLogs(query: AuditLogsQuery = {}) {
    return useQuery({
        queryKey: ["osmium", "audit", query.resourceType, query.resourceTypes?.join(","), query.pageSize, query.page],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/audit", {
                params: {
                    query: {
                        resource_type: query.resourceType,
                        resource_types: query.resourceTypes && query.resourceTypes.length
                            ? query.resourceTypes.join(",")
                            : undefined,
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
