import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

export function useWelcomeMessageContent() {
    return useQuery({
        queryKey: ["osmium", "welcome-messages", "content"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/welcome-messages");
            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateWelcomeMessageContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (body: { home_text: string; visitor_text: string }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/welcome-messages", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(["osmium", "welcome-messages", "content"], data);
        },
    });
}

export function useMyWelcomeMessage() {
    return useQuery({
        queryKey: ["osmium", "welcome-messages", "me"],
        retry: false,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/welcome-message");
            if (error) throw error;
            return data;
        },
    });
}

export function useAcknowledgeWelcomeMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { error } = await osmium.POST("/api/v1/welcome-message/ack");
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.setQueryData(["osmium", "welcome-messages", "me"], { show: false, text: null });
        },
    });
}
