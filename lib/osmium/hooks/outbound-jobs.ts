import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

const LIST_KEY = ["osmium", "outbound-jobs"];

export function useOutboundJobs(params: { page?: number, pageSize?: number, status?: string } = {}) {
    return useQuery({
        queryKey: [...LIST_KEY, params.page, params.pageSize, params.status],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/integrations/outbound-jobs", {
                params: {
                    query: {
                        page: params.page,
                        page_size: params.pageSize ?? 25,
                        status: params.status || undefined,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useRunOutboundJobs() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data, error } = await osmium.POST("/api/v1/admin/integrations/outbound-jobs/run");
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: LIST_KEY });
        },
    });
}

export function useQueueAnnouncement() {
    return useMutation({
        mutationFn: async (body: {
            title: string,
            body_markdown: string,
            details_url?: string,
            send_discord?: boolean,
            send_email?: boolean,
            channel?: string,
        }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/notifications/announcements", { body });
            if (error) throw error;
            return data;
        },
    });
}
