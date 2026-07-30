import {useMe} from "@/lib/osmium/hooks/me";

/**
 * Checks whether the `/me` effective-permission tree contains a dotted
 * permission path, e.g. `"pages.facility_admin.read"`.
 *
 * osmium returns permissions as a nested tree — `{domain: {resource: [actions]}}`
 * — so the final path segment is the action (an entry in the leaf `string[]`) and
 * the preceding segments walk the nested objects. `server_admin` holds every
 * permission, so it always passes.
 *
 * Access is ALWAYS an explicit permission grant: never an implied role and never
 * a staff-position (roster) tag.
 */
export function meHasPermission(
    me: {server_admin?: boolean; permissions?: unknown} | undefined,
    path: string,
): boolean {
    if (!me) return false;
    if (me.server_admin) return true;

    const segments = path.split(".");
    const action = segments.pop();
    if (action === undefined) return false;

    let node: unknown = me.permissions;
    for (const segment of segments) {
        if (typeof node !== "object" || node === null || Array.isArray(node)) return false;
        node = (node as Record<string, unknown>)[segment];
        if (node === undefined) return false;
    }

    return Array.isArray(node) && node.includes(action);
}

export function useHasPermission(path: string): {allowed: boolean; isLoading: boolean} {
    const {data: me, isLoading} = useMe();
    return {allowed: meHasPermission(me, path), isLoading};
}
