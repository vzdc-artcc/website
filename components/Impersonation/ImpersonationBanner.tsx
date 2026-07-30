'use client';
import React from 'react';
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useMe } from "@/lib/osmium/hooks/me";
import { useStopImpersonation } from "@/lib/osmium/hooks/impersonation";

/**
 * Global "acting as …" banner shown whenever the current session is impersonating
 * another user (osmium spec 012). Reads the `impersonation` field osmium adds to
 * `/me`, and offers the stop control. Rendered app-wide from the root layout so it
 * is always visible while impersonating.
 */
export default function ImpersonationBanner() {
    const { data: me } = useMe();
    const stop = useStopImpersonation();

    if (!me?.impersonation) {
        return <></>;
    }

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: (theme) => theme.zIndex.appBar + 1,
                backgroundColor: 'warning.dark',
                color: 'warning.contrastText',
                px: 2,
                py: 1,
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="center"
            >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <VisibilityIcon fontSize="small" />
                    <Typography variant="body2">
                        Impersonating <strong>{me.display_name}</strong> (CID {me.cid}) as{' '}
                        <strong>{me.impersonation.impersonator_display_name}</strong> (CID{' '}
                        {me.impersonation.impersonator_cid}).
                    </Typography>
                </Stack>
                <Button
                    size="small"
                    variant="contained"
                    color="inherit"
                    disabled={stop.isPending}
                    onClick={() => stop.mutate()}
                    startIcon={stop.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
                    sx={{ color: 'warning.dark', backgroundColor: 'warning.contrastText' }}
                >
                    Stop impersonating
                </Button>
            </Stack>
        </Box>
    );
}
