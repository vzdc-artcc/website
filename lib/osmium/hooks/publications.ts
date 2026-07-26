import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";
import type { components } from "@/lib/osmium/generated/schema";

export type Publication = components["schemas"]["Publication"];
export type PublicationCategory = components["schemas"]["PublicationCategory"];

interface PublicationInput {
    category_id: string;
    title: string;
    description?: string | null;
    effective_at: string;
    file_id: string;
    is_public: boolean;
    sort_order?: number;
    status: "draft" | "published" | "archived";
}

interface PublicationCategoryInput {
    key: string;
    name: string;
    description?: string | null;
    sort_order?: number;
}

interface PublicationsQuery {
    page?: number;
    pageSize?: number;
}

export function usePublications(query: PublicationsQuery = {}) {
    return useQuery({
        queryKey: ["osmium", "publications", query.page, query.pageSize],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/publications", {
                params: {
                    query: {
                        page: query.page ?? null,
                        page_size: query.pageSize ?? null,
                        limit: null,
                        offset: null,
                    },
                },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function usePublication(publicationId: string | undefined) {
    return useQuery({
        queryKey: ["osmium", "publication", publicationId],
        enabled: !!publicationId,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/publications/{publication_id}", {
                params: { path: { publication_id: publicationId! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function usePublicationCategories() {
    return useQuery({
        queryKey: ["osmium", "publication-categories"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/publications/categories");
            if (error) throw error;
            return data;
        },
    });
}

// --- Admin ---

export function useAdminPublications() {
    return useQuery({
        queryKey: ["osmium", "admin", "publications", "list"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/publications", {
                params: { query: { page_size: 500 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreatePublication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: PublicationInput) => {
            const { data, error } = await osmium.POST("/api/v1/admin/publications", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["osmium", "publication"] }).then(() =>
            queryClient.invalidateQueries({ queryKey: ["osmium", "admin", "publications"] })),
    });
}

export function useUpdatePublication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ publicationId, body }: { publicationId: string; body: PublicationInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/publications/{publication_id}", {
                params: { path: { publication_id: publicationId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["osmium", "admin", "publications"] }),
    });
}

export function useDeletePublication() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (publicationId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/publications/{publication_id}", {
                params: { path: { publication_id: publicationId } },
            });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["osmium", "admin", "publications"] }),
    });
}

export function useAdminPublicationCategories() {
    return useQuery({
        queryKey: ["osmium", "admin", "publication-categories", "list"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/publications/categories");
            if (error) throw error;
            return data;
        },
    });
}

export function useCreatePublicationCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: PublicationCategoryInput) => {
            const { data, error } = await osmium.POST("/api/v1/admin/publications/categories", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["osmium", "publication-categories"] }).then(() =>
            queryClient.invalidateQueries({ queryKey: ["osmium", "admin", "publication-categories"] })),
    });
}

export function useUpdatePublicationCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ categoryId, body }: { categoryId: string; body: PublicationCategoryInput }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/publications/categories/{category_id}", {
                params: { path: { category_id: categoryId } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["osmium", "publication-categories"] }).then(() =>
            queryClient.invalidateQueries({ queryKey: ["osmium", "admin", "publication-categories"] })),
    });
}

export function useDeletePublicationCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (categoryId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/publications/categories/{category_id}", {
                params: { path: { category_id: categoryId } },
            });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["osmium", "publication-categories"] }).then(() =>
            queryClient.invalidateQueries({ queryKey: ["osmium", "admin", "publication-categories"] })),
    });
}
