import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { osmium } from "@/lib/osmium/client";

// Generated OpenAPI types `permissions` as `unknown` since it's a
// recursive tree (intermediate segments nest as objects, the final segment
// holds an array of snake_case action strings) — narrowed here instead of
// waiting on codegen improvements, per docs/staff-permissions-editor.md.
export type PermissionTree = { [segment: string]: PermissionTree | string[] };

/** Flattens a permission tree into dotted leaf strings, e.g. "auth.profile.read". */
export function flattenPermissionTree(tree: PermissionTree, prefix: string[] = []): string[] {
    return Object.entries(tree).flatMap(([key, value]) => {
        const path = [...prefix, key];
        if (Array.isArray(value)) {
            return value.map((action) => [...path, action].join("."));
        }
        return flattenPermissionTree(value, path);
    });
}

/** Inverse of flattenPermissionTree: dotted leaf strings back into a nested tree. */
export function buildPermissionTree(paths: string[]): PermissionTree {
    const root: PermissionTree = {};
    for (const path of paths) {
        const parts = path.split(".");
        const action = parts.pop();
        if (!action || parts.length === 0) continue;

        const leaf = parts[parts.length - 1];
        let node = root;
        for (const segment of parts.slice(0, -1)) {
            const existing = node[segment];
            if (existing && !Array.isArray(existing)) {
                node = existing;
            } else {
                const created: PermissionTree = {};
                node[segment] = created;
                node = created;
            }
        }

        const actions = node[leaf];
        if (Array.isArray(actions)) {
            if (!actions.includes(action)) actions.push(action);
        } else {
            node[leaf] = [action];
        }
    }
    return root;
}

/** Groups flat dotted permission strings by their top-level segment (e.g. "auth", "training"). */
export function groupByTopLevelSegment(paths: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};
    for (const path of paths) {
        const top = path.split(".")[0];
        (groups[top] ??= []).push(path);
    }
    return groups;
}

/**
 * Self-service baseline granted once on a user's first login
 * (osmium src/handlers/auth.rs ensure_user_login_access) — must stay in
 * sync with that list. Always shown checked and locked in the picker, and
 * always merged into the save payload so an admin can never lock a user out
 * of their own profile/session/self-service flows, and so the backend's
 * empty-tree rejection never fires.
 */
export const BASELINE_PERMISSIONS: string[] = [
    "auth.profile.read",
    "auth.profile.update",
    "auth.teamspeak_uids.read",
    "auth.teamspeak_uids.create",
    "auth.teamspeak_uids.delete",
    "auth.sessions.delete",
    "users.vatusa_refresh.self.request",
    "users.visit_artcc.request",
    "users.visitor_applications.self.read",
    "users.visitor_applications.self.request",
    "users.directory.read",
    "feedback.items_self.read",
    "feedback.items.create",
    "events.positions.self.request",
];

export function useAccessCatalog() {
    return useQuery({
        queryKey: ["osmium", "access", "catalog"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/access/catalog");
            if (error || !data) throw error ?? new Error("no access catalog returned");
            return {
                ...data,
                permissions: flattenPermissionTree((data.permissions ?? {}) as PermissionTree),
            };
        },
    });
}

export function useUserAccess(cid: number) {
    return useQuery({
        queryKey: ["osmium", "access", "user", cid],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/users/{cid}/access", {
                params: { path: { cid } },
            });
            if (error || !data) throw error ?? new Error("no user access returned");
            return {
                ...data,
                permissions: flattenPermissionTree((data.permissions ?? {}) as PermissionTree),
            };
        },
        enabled: Number.isFinite(cid),
    });
}

/** The acting staffer's own effective permissions — used to restrict which
 * permissions they're allowed to grant/revoke on someone else. */
export function useMyAccess() {
    return useQuery({
        queryKey: ["osmium", "access", "me"],
        queryFn: async () => {
            const { data, error } = await osmium.GET("/api/v1/admin/acl");
            if (error || !data) throw error ?? new Error("no acl returned");
            return {
                ...data,
                permissions: flattenPermissionTree((data.permissions ?? {}) as PermissionTree),
            };
        },
    });
}

export function useUpdateUserAccess() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ cid, permissions, reason }: { cid: number; permissions: string[]; reason: string }) => {
            const { data, error } = await osmium.POST("/api/v1/admin/users/{cid}/access", {
                params: { path: { cid } },
                body: { permissions: buildPermissionTree(permissions), reason },
            });
            if (error) throw error;
            return data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["osmium", "access", "user", variables.cid] });
        },
    });
}
