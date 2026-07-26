import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

// The 10 CertificationOption keys, matching osmium's check constraints and the
// legacy Prisma `CertificationOption` enum.
export const CERTIFICATION_OPTIONS = [
    "NONE",
    "UNRESTRICTED",
    "DEL",
    "GND",
    "TWR",
    "APP",
    "CTR",
    "TIER_1",
    "CERTIFIED",
    "SOLO",
] as const;

export type CertificationOption = (typeof CERTIFICATION_OPTIONS)[number];

// --- Certification types (admin) ---

export function useCertificationTypes() {
    return useQuery({
        queryKey: ["osmium", "certification-types", "list"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/certification-types");
            if (error) throw error;
            return data;
        },
    });
}

/**
 * Bulk per-controller cert/solo/LOA summary for the roster table. One request
 * covers every rostered cid (granted certs, active-solo type ids, approved-LOA
 * flag) instead of an N+1 per-controller fetch.
 */
export function useRosterCertifications() {
    return useQuery({
        queryKey: ["osmium", "roster-certifications", "list"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/roster-certifications");
            if (error) throw error;
            return data?.items ?? [];
        },
    });
}

interface CertificationTypeInput {
    id?: string;
    name: string;
    can_solo_cert: boolean;
    auto_assign_unrestricted: boolean;
    certification_options: string[];
}

export function useUpsertCertificationType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: CertificationTypeInput) => {
            const { data, error } = await osmium.POST("/api/v1/admin/certification-types", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "certification-types"] });
        },
    });
}

export function useReorderCertificationTypes() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (items: { id: string; order: number }[]) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/certification-types/order", {
                body: { items },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "certification-types"] });
        },
    });
}

export function useDeleteCertificationType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/certification-types/{id}", {
                params: { path: { id } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "certification-types"] });
        },
    });
}

// --- A controller's certification grid ---

export function useUserCertifications(cid: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "users", "certifications", cid],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/{cid}/certifications", {
                params: { path: { cid: cid! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useSaveUserCertifications(cid: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: {
            certifications: { certification_type_id: string; certification_option: string }[];
            dossier_message: string;
        }) => {
            const { data, error } = await osmium.POST("/api/v1/users/{cid}/certifications", {
                params: { path: { cid } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", "certifications", cid] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", "dossier", cid] });
        },
    });
}

// --- Solo certifications (for the SOLO overlay on a controller's grid) ---

export function useUserSoloCertifications(cid: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "users", "solo-certifications", cid],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/{cid}/solo-certifications", {
                params: { path: { cid: cid! }, query: { page_size: 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useAdminSoloCertifications(query: { cid?: number } = {}) {
    return useQuery({
        queryKey: ["osmium", "admin", "solo-certifications", "list", query.cid],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/solo-certifications", {
                params: { query: { page_size: 200, cid: query.cid } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useCreateSoloCertification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: {
            user_id: string;
            certification_type_id: string;
            position: string;
            expires: string;
        }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/solo-certifications", { body });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "admin", "solo-certifications"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", "solo-certifications"] });
        },
    });
}

export function useDeleteSoloCertification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (soloId: string) => {
            const { error } = await osmium.DELETE("/api/v1/admin/solo-certifications/{solo_id}", {
                params: { path: { solo_id: soloId } },
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "admin", "solo-certifications"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", "solo-certifications"] });
        },
    });
}
