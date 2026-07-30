import {useMe} from "@/lib/osmium/hooks/me";

export interface CoarseRoles {
    isStaff: boolean;
    isInstructor: boolean;
    isMentor: boolean;
    isEventStaff: boolean;
}

/**
 * Maps osmium's role names onto the same coarse buckets the site's old
 * NextAuth Role[] (CONTROLLER/MENTOR/INSTRUCTOR/STAFF/EVENT_STAFF/WEB_TEAM)
 * used to gate on. STAFF folds into every other bucket, matching the
 * existing site behavior where every INSTRUCTOR/MENTOR/EVENT_STAFF check
 * was already OR'd with STAFF. server_admin is OR'd into every check since
 * a claimed server admin holds no other role rows (assign_server_admin
 * clears them).
 */
export function deriveCoarseRoles(me: { server_admin: boolean, role_names: string[] } | undefined): CoarseRoles {
    const has = (role: string) => !!me && (me.server_admin || me.role_names.includes(role));
    const isStaff = has("STAFF");
    return {
        isStaff,
        isInstructor: isStaff || has("INS"),
        isMentor: isStaff || has("INS") || has("MTR"),
        isEventStaff: isStaff || has("EVENT_STAFF"),
    };
}

export function useCoarseRoles(): CoarseRoles & { isLoading: boolean } {
    const {data: me, isLoading} = useMe();
    return {...deriveCoarseRoles(me), isLoading};
}
