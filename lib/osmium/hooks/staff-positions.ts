import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";
import { useMe } from "@/lib/osmium/hooks/me";

export const STAFF_POSITIONS = [
    "ATM", "DATM", "TA", "EC", "WM", "FE", "AEC", "AWM", "AFE", "EP", "TMU",
    "FC", "INS", "MTR",
] as const;

export type StaffPosition = typeof STAFF_POSITIONS[number];

function staffPositionsKey(cid: number) {
    return ["osmium", "users", cid, "staff-positions"];
}

export function useStaffPositions(cid: number) {
    return useQuery({
        queryKey: staffPositionsKey(cid),
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/users/{cid}/staff-positions", {
                params: { path: { cid } },
            });
            if (error) throw error;
            return data;
        },
        enabled: Number.isFinite(cid),
    });
}

/** Controllers holding a given staff position (e.g. all ATM holders). */
export function useStaffPositionHolders(position: string) {
    return useQuery({
        queryKey: ["osmium", "staff-positions", position, "holders"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/staff-positions/{position}/holders", {
                params: { path: { position } },
            });
            if (error) throw error;
            return data;
        },
    });
}

/** The display name of the first holder of a staff position, or 'N/A'. */
export function useStaffPositionHolderName(position: string): string {
    const { data } = useStaffPositionHolders(position);
    return data?.holders?.[0]?.display_name ?? "N/A";
}

/** The current user's own held staff positions, from osmium (Phase 6). */
export function useMyStaffPositions() {
    const { data: me } = useMe();
    return useStaffPositions(me?.cid ?? NaN);
}

/**
 * Whether the current user holds any of the given staff-position codes,
 * from osmium — replaces the frozen NextAuth `session.user.staffPositions`
 * checks (Phase 6). Returns `{ has, isLoading }`.
 */
export function useHasStaffPosition(codes: string[]) {
    const { data, isLoading } = useMyStaffPositions();
    const held = (data?.positions ?? []).map((p) => p.position);
    return { has: codes.some((c) => held.includes(c)), isLoading };
}

export function useAssignStaffPosition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ cid, position }: { cid: number, position: StaffPosition }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/users/{cid}/staff-positions/{position}", {
                params: { path: { cid, position } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: staffPositionsKey(variables.cid) });
        },
    });
}

export function useRevokeStaffPosition() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ cid, position }: { cid: number, position: StaffPosition }) => {
            const { data, error } = await osmium.DELETE("/api/v1/admin/users/{cid}/staff-positions/{position}", {
                params: { path: { cid, position } },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: staffPositionsKey(variables.cid) });
        },
    });
}
