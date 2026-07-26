'use client';
import React from 'react';
import {Box, CircularProgress, Typography} from "@mui/material";
import {useCoarseRoles, CoarseRoles} from "@/lib/osmium/coarseRoles";

/**
 * Client-side route guard gating on osmium role data (Phase 6). Replaces the
 * server-side `getServerSession().user.roles.includes(...)` layout gates —
 * osmium's session cookie is host-only for the API origin and can't be read
 * from the website's server, so route protection has to move client-side
 * (migration doc §3.1). Renders a spinner while `/me` loads, a no-access
 * message if the check fails, and children when allowed.
 */
export default function RequireRole({check, children}: {
    check: keyof CoarseRoles,
    children: React.ReactNode,
}) {
    const coarse = useCoarseRoles();

    if (coarse.isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!coarse[check]) {
        return <Typography variant="h5" textAlign="center">You do not have access to this page.</Typography>;
    }

    return <>{children}</>;
}
