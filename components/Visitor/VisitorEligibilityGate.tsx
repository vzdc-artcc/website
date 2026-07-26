'use client';
import React from 'react';
import {Box, CircularProgress} from "@mui/material";
import {useMe} from "@/lib/osmium/hooks/me";
import ErrorCard from "@/components/Error/ErrorCard";

// Ratings below S3 aren't eligible to apply to visit (matches the legacy
// `rating < 4` check, where S3 = 4). osmium exposes rating as its label.
const INELIGIBLE_RATINGS = ['OBS', 'S1', 'S2'];

/**
 * Gates the visitor-application page on osmium's /me (Phase 6): must be
 * logged in, must NOT already be a rostered controller (controller_status
 * NONE), and must be S3 or higher.
 */
export default function VisitorEligibilityGate({children}: { children: React.ReactNode }) {
    const {data: me, isLoading} = useMe();

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}><CircularProgress/></Box>;
    }

    if (!me) {
        return <ErrorCard heading="Visitor Application"
                          message="You must be logged in to submit a visitor application."/>;
    }

    if (me.controller_status && me.controller_status !== "NONE") {
        return <ErrorCard heading="Visitor Application" message="You are already a rostered controller."/>;
    }

    if (me.rating && INELIGIBLE_RATINGS.includes(me.rating)) {
        return <ErrorCard heading="Visitor Application"
                          message="You must be a(n) S3 or higher to submit a visitor application."/>;
    }

    return <>{children}</>;
}
