'use client';
import React from 'react';
import {Box, CircularProgress, Typography} from "@mui/material";
import {useHasPermission} from "@/lib/osmium/permissions";

/**
 * Client-side route guard gating on an explicit osmium permission (e.g.
 * `"pages.facility_admin.read"`). Staff-page access is always an explicit
 * permission grant — never an implied role and never a staff-position tag.
 * Renders a spinner while `/me` loads, a no-access message if the permission is
 * missing, and children when the permission is held.
 */
export default function RequirePermission({perm, children}: {
    perm: string,
    children: React.ReactNode,
}) {
    const {allowed, isLoading} = useHasPermission(perm);

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!allowed) {
        return <Typography variant="h5" textAlign="center">You do not have access to this page.</Typography>;
    }

    return <>{children}</>;
}
