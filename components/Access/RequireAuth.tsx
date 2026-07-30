'use client';
import React from 'react';
import {Box, CircularProgress, Typography} from "@mui/material";
import {useMe} from "@/lib/osmium/hooks/me";

/**
 * Client-side "must be logged in" gate (Phase 6), replacing server-side
 * `getServerSession` presence checks. Spinner while /me loads, a prompt if
 * unauthenticated, children otherwise.
 */
export default function RequireAuth({children}: { children: React.ReactNode }) {
    const {data: me, isLoading} = useMe();

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (!me) {
        return <Typography variant="h5" textAlign="center">You must be logged in to view this page.</Typography>;
    }

    return <>{children}</>;
}
