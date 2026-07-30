import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";
import type { components } from "@/lib/osmium/generated/schema";

export function useEmailTemplates() {
    return useQuery({
        queryKey: ["osmium", "emails", "templates"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/emails/templates");
            if (error) throw error;
            return data;
        },
    });
}

export function usePreviewEmail() {
    return useMutation({
        mutationFn: async (body: components["schemas"]["EmailPreviewRequest"]) => {
            const { data, error } = await osmium.POST("/api/v1/emails/preview", { body });
            if (error) throw error;
            return data;
        },
    });
}

export function useSendEmail() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: components["schemas"]["EmailSendRequest"]) => {
            const { data, error } = await osmium.POST("/api/v1/emails/send", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "emails", "outbox"] });
        },
    });
}

export function useEmailOutbox(params: { page?: number, pageSize?: number, status?: string, templateId?: string } = {}) {
    return useQuery({
        queryKey: ["osmium", "emails", "outbox", params.page, params.pageSize, params.status, params.templateId],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/emails/outbox", {
                params: {
                    query: {
                        page: params.page,
                        page_size: params.pageSize ?? 25,
                        status: params.status || undefined,
                        template_id: params.templateId || undefined,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useEmailOutboxDetail(id: string) {
    return useQuery({
        queryKey: ["osmium", "emails", "outbox", id],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/emails/outbox/{id}", {
                params: { path: { id } },
            });
            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
}

export function useResubscribeEmail() {
    return useMutation({
        mutationFn: async (body: components["schemas"]["EmailResubscribeRequest"]) => {
            const { data, error } = await osmium.POST("/api/v1/emails/resubscribe", { body });
            if (error) throw error;
            return data;
        },
    });
}

// Public, token-authenticated — no session required. Backs the unsubscribe
// link every outbound email footer points to (`/emails/unsubscribe?token=`).
export function useEmailPreferences(token: string) {
    return useQuery({
        queryKey: ["osmium", "emails", "preferences", token],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/emails/preferences", {
                params: { query: { token } },
            });
            if (error) throw error;
            return data;
        },
        enabled: !!token,
        retry: false,
    });
}

export function useUpdateEmailPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: components["schemas"]["EmailPreferencesUpdateRequest"]) => {
            const { data, error } = await osmium.POST("/api/v1/emails/preferences", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "emails", "preferences", variables.token] });
        },
    });
}

// Session-authenticated per-category email preferences — backs the profile
// "Email Preferences" section. Same category model as the token flow, but the
// caller's email is resolved from their session (no unsubscribe token).
export function useMyEmailPreferences() {
    return useQuery({
        queryKey: ["osmium", "me", "email-preferences"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/me/email-preferences");
            if (error) throw error;
            return data;
        },
        retry: false,
    });
}

export function useUpdateMyEmailPreferences() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: components["schemas"]["MeEmailPreferencesUpdateRequest"]) => {
            const { data, error } = await osmium.PUT("/api/v1/me/email-preferences", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "me", "email-preferences"] });
        },
    });
}
