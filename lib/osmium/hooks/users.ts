import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";
import type { components } from "@/lib/osmium/generated/schema";

export type UserListItem = components["schemas"]["UserListItem"];

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

/**
 * Loads the ENTIRE user list for client-side search. osmium's `/users` endpoint
 * has no text-search param and caps `page_size` at 200, so we page through it
 * (using `has_next`) and accumulate every user. Cached for 5 minutes since the
 * roster changes slowly. Use with an Autocomplete that filters client-side.
 */
export function useAllUsers() {
    return useQuery({
        queryKey: ["osmium", "users", "all"],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const items: UserListItem[] = [];
            let page = 1;
            // Hard cap the loop so a bad `has_next` can never spin forever.
            for (let i = 0; i < 50; i++) {
                const { data, error } = await osmium.GET("/api/v1/users", {
                    params: { query: { page, page_size: 200 } },
                });
                if (error) throw error;
                items.push(...(data?.items ?? []));
                if (!data?.has_next) break;
                page += 1;
            }
            return items;
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

export function useUserSessions(cid: number | undefined) {
    return useQuery({
        queryKey: ["osmium", "users", cid, "sessions"],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/users/{cid}/sessions", {
                params: { path: { cid: cid! } },
            });
            if (error) throw error;
            return data;
        },
    });
}

export function useRevokeSession(cid: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (sessionId: string) => {
            const { data, error } = await osmium.DELETE(
                "/api/v1/admin/users/{cid}/sessions/{session_id}",
                { params: { path: { cid, session_id: sessionId } } },
            );
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", cid, "sessions"] });
        },
    });
}

export function useRevokeAllSessions(cid: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const { data, error } = await osmium.DELETE("/api/v1/admin/users/{cid}/sessions", {
                params: { path: { cid } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "users", cid, "sessions"] });
        },
    });
}

export function useUserIpHistory(cid: number | undefined, page: number = 1) {
    return useQuery({
        queryKey: ["osmium", "users", cid, "ip-history", page],
        enabled: !!cid,
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/users/{cid}/ip-history", {
                params: { path: { cid: cid! }, query: { page, page_size: 25 } },
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

/**
 * Admin bulk export of every on-roster controller's GDPR data document
 * (`GET /api/v1/admin/data-export/roster`). SERVER_ADMIN-only on the backend
 * (`users.data_export.read`); the Website Management area is already
 * `server_admin`-gated. Returns the full MassDataExportDocument for the caller to
 * save as a file.
 */
export function useDownloadRosterDataExport() {
    return useMutation({
        mutationFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/data-export/roster");
            if (error) throw error;
            return data;
        },
    });
}
