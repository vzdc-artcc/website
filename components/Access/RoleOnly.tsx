'use client';
import React from 'react';
import {useCoarseRoles, CoarseRoles} from "@/lib/osmium/coarseRoles";

/**
 * Inline client-side conditional: renders children only when the viewer
 * holds the given coarse role (osmium-backed). Unlike RequireRole this shows
 * nothing (no spinner, no message) while loading or denied — for optional UI
 * like a "New X" button that simply shouldn't appear for non-staff.
 */
export default function RoleOnly({check, children}: {
    check: keyof CoarseRoles,
    children: React.ReactNode,
}) {
    const coarse = useCoarseRoles();
    if (coarse.isLoading || !coarse[check]) {
        return null;
    }
    return <>{children}</>;
}
