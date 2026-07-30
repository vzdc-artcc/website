'use client';
import React from 'react';
import {Box, CircularProgress, Typography} from "@mui/material";
import {useMe} from "@/lib/osmium/hooks/me";
import {useStaffPositions} from "@/lib/osmium/hooks/staff-positions";

/**
 * Client-side gate for the solo-endorsement pages, whose access rule is the
 * special `INSTRUCTOR || staffPositions:WM` — it folds in a staff *position*
 * (WM), not general STAFF, so it needs osmium's staff-position data alongside
 * `role_names` (Phase 6). `silent` renders nothing when denied/loading (for
 * an optional "Grant Solo Endorsement" link); otherwise shows a spinner then
 * a no-access message (for the whole new-endorsement page).
 */
export default function SolosGate({silent, children}: {
    silent?: boolean,
    children: React.ReactNode,
}) {
    const {data: me, isLoading: meLoading} = useMe();
    const {data: positions, isLoading: posLoading} = useStaffPositions(me?.cid ?? NaN);

    if (meLoading || posLoading || !me) {
        return silent ? null : (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    const allowed = me.role_names.includes("INS")
        || (positions?.positions ?? []).some((p) => p.position === "WM");

    if (!allowed) {
        return silent ? null
            : <Typography variant="h5" textAlign="center">You must be an instructor to access this page.</Typography>;
    }

    return <>{children}</>;
}
