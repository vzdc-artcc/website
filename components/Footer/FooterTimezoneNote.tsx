'use client';
import React from 'react';
import {Typography} from "@mui/material";
import {useMe} from "@/lib/osmium/hooks/me";

/**
 * The "times are displayed in <timezone>" footer note — sourced from
 * osmium's /me (Phase 6). Renders nothing when not authenticated.
 */
export default function FooterTimezoneNote() {
    const {data: me} = useMe();

    if (!me) {
        return null;
    }

    return (
        <Typography variant="subtitle1" fontSize={12} textAlign="center">All non-zulu times are
            displayed in <b>{me.profile.timezone}</b>. You can change this in &apos;Your
            Profile&apos;.</Typography>
    );
}
