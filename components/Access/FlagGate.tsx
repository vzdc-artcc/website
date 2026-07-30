'use client';
import React from 'react';
import {Box, CircularProgress} from "@mui/material";
import {useMe} from "@/lib/osmium/hooks/me";
import ErrorCard from "@/components/Error/ErrorCard";

type FlagKey =
    | "no_request_loas"
    | "no_request_training_assignments"
    | "no_request_trainer_release"
    | "no_force_progression_finish"
    | "no_event_signup"
    | "no_edit_profile"
    | "excluded_from_roster_sync"
    | "hidden_from_roster";

/**
 * Gates children on one of the current user's self-service opt-out flags
 * (Phase 6, sourced from osmium's /me). If the flag is set, shows a denial
 * message instead of the children. Assumes the caller is already behind an
 * auth gate (e.g. the profile layout's RequireAuth).
 */
export default function FlagGate({flag, deniedHeading, deniedMessage, children}: {
    flag: FlagKey,
    deniedHeading: string,
    deniedMessage: string,
    children: React.ReactNode,
}) {
    const {data: me, isLoading} = useMe();

    if (isLoading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (me?.flags[flag]) {
        return <ErrorCard heading={deniedHeading} message={deniedMessage}/>;
    }

    return <>{children}</>;
}
