'use client';
import React from 'react';
import {Box, CircularProgress, Typography} from "@mui/material";
import {useHasStaffPosition} from "@/lib/osmium/hooks/staff-positions";

/**
 * Client-side gate requiring the current user to hold one of the given
 * staff-position codes (osmium-backed, Phase 6) — replaces server-side
 * `session.user.staffPositions.includes(...)` gates. Spinner while loading,
 * a no-access message otherwise.
 */
export default function RequireStaffPosition({positions, silent, children}: {
    positions: string[],
    silent?: boolean,
    children: React.ReactNode,
}) {
    const {has, isLoading} = useHasStaffPosition(positions);

    if (isLoading) {
        return silent ? null : (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!has) {
        return silent ? null
            : <Typography variant="h5" textAlign="center">You do not have access to this page.</Typography>;
    }

    return <>{children}</>;
}
