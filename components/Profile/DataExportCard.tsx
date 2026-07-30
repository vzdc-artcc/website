'use client';
import React from 'react';
import { Alert, Button, CircularProgress, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { toast } from "react-toastify";
import { useMe, useDownloadDataExport } from "@/lib/osmium/hooks/me";

/**
 * Self-service GDPR data export (Article 15). Login-aware so it can live on the
 * public privacy page: signed-in users get a download button, everyone else gets a
 * prompt to sign in. Downloads the full cross-domain JSON document osmium assembles
 * for the caller (`GET /me/data-export`) as a file.
 */
export default function DataExportCard() {
    const { data: me, isLoading } = useMe();
    const download = useDownloadDataExport();

    const handleDownload = async () => {
        if (!me) return;
        try {
            const doc = await download.mutateAsync();
            const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const date = new Date().toISOString().slice(0, 10);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `vzdc-data-export-${me.cid}-${date}.json`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            toast('Your data export was downloaded.', { type: 'success' });
        } catch (error: unknown) {
            const code = (error as { error?: string } | null)?.error;
            toast(
                code === 'too_many_requests'
                    ? "You've requested your data export too many times. Please wait a little while and try again."
                    : 'Failed to generate your data export.',
                { type: 'error' },
            );
        }
    };

    return (
        <Stack direction="column" spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
                You can download a copy of all personal data vZDC holds about you — identity,
                training, events, feedback, incidents, workflows, certifications, notifications, and
                activity — in a machine-readable JSON format. This satisfies your right of access and
                portability under GDPR (Articles 15 and 20); the file includes a notice describing how
                your data is processed.
            </Typography>

            {isLoading ? (
                <CircularProgress size={24} />
            ) : me ? (
                <div>
                    <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={download.isPending ? <CircularProgress size={18} color="inherit" /> : <DownloadIcon />}
                        onClick={handleDownload}
                        disabled={download.isPending}
                    >
                        {download.isPending ? 'Preparing…' : 'Download my data'}
                    </Button>
                </div>
            ) : (
                <Alert severity="info">Sign in to download your personal data.</Alert>
            )}
        </Stack>
    );
}
