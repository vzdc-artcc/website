import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

export function useRosterControllers() {
    return useQuery({
        queryKey: ["osmium", "users", "roster-controllers"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users", {
                params: { query: { controllers_only: true, page_size: 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useUsersByRole(role: string) {
    return useQuery({
        queryKey: ["osmium", "users", "by-role", role],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users", {
                params: { query: { role, page_size: 200 } },
            });
            if (error) throw error;
            return data;
        },
    });
}

/** Flat training-staff shape the statistics selector needs. */
export interface TrainingStaffOption {
    cid: string;
    firstName: string;
    lastName: string;
}

/**
 * Merged, de-duplicated MENTOR + INSTRUCTOR roster for the training-statistics
 * trainer selector.
 */
export function useTrainingStaff(): { data: TrainingStaffOption[]; isLoading: boolean } {
    const mentors = useUsersByRole("MENTOR");
    const instructors = useUsersByRole("INSTRUCTOR");

    const byCid = new Map<string, TrainingStaffOption>();
    for (const list of [mentors.data, instructors.data]) {
        for (const item of list?.items ?? []) {
            const cid = item.basic.cid.toString();
            if (byCid.has(cid)) continue;
            byCid.set(cid, {
                cid,
                firstName: item.full?.first_name ?? item.basic.name,
                lastName: item.full?.last_name ?? "",
            });
        }
    }

    return {
        data: Array.from(byCid.values()).sort((a, b) => a.lastName.localeCompare(b.lastName)),
        isLoading: mentors.isLoading || instructors.isLoading,
    };
}

export function useUserByCid(cid: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "users", "by-cid", cid],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/{cid}", {
                params: { path: { cid: cid! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useUserFlags(cid: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "users", cid, "flags"],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/users/{cid}/flags", {
                params: { path: { cid: cid! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useUpdateUserFlags() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ cid, reason, ...flags }: {
            cid: number,
            reason: string,
            no_request_loas: boolean,
            no_request_training_assignments: boolean,
            no_request_trainer_release: boolean,
            no_force_progression_finish: boolean,
            no_event_signup: boolean,
            no_edit_profile: boolean,
            excluded_from_roster_sync: boolean,
            hidden_from_roster: boolean,
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/users/{cid}/flags", {
                params: { path: { cid } },
                body: { ...flags, reason },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", variables.cid, "flags"] });
        },
    });
}

export function useReassignOperatingInitials() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ cid, operatingInitials }: { cid: number, operatingInitials: string }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/users/{cid}/operating-initials", {
                params: { path: { cid } },
                body: { operating_initials: operatingInitials },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "users"] });
        },
    });
}

export function useAdminUpdateProfile() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ cid, body }: {
            cid: number,
            body: {
                preferred_name?: string | null,
                bio?: string | null,
                timezone: string,
            },
        }) => {
            const { data, error } = await osmium.PATCH("/api/v1/admin/users/{cid}/profile", {
                params: { path: { cid } },
                body,
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "users"] });
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", "by-cid", variables.cid] });
        },
    });
}
