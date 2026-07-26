'use client';
import React from 'react';
import {Alert, Button, Card, CardContent, CircularProgress, Stack, Typography} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import {toast} from "react-toastify";
import {useDownloadRosterDataExport} from "@/lib/osmium/hooks/users";

/**
 * Admin bulk data export: downloads the full GDPR personal-data document for every
 * on-roster controller as one JSON file. Lives in the SERVER_ADMIN-gated Website
 * Management area; the backend independently enforces `users.data_export.read`.
 */
export default function RosterDataExportCard() {
    const download = useDownloadRosterDataExport();

    const handleDownload = async () => {
        try {
            const doc = await download.mutateAsync();
            const blob = new Blob([JSON.stringify(doc, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const date = new Date().toISOString().slice(0, 10);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `vzdc-roster-data-export-${date}.json`;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
            toast(`Exported ${doc?.subject_count ?? 0} controller record(s).`, {type: 'success'});
        } catch (error: unknown) {
            const code = (error as { error?: string } | null)?.error;
            toast(
                code === 'too_many_requests'
                    ? "You've run the roster export too many times. Please wait a little while and try again."
                    : 'Failed to generate the roster data export.',
                {type: 'error'},
            );
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="column" spacing={1.5}>
                    <Typography variant="h6">Roster Data Export</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Download the full personal-data document for every on-roster controller in one
                        machine-readable JSON file — identity, training, certifications, events, feedback,
                        incidents, workflows, notifications, and activity per controller, each with the
                        same GDPR transparency notice as the self-service export. Use this for compliance
                        record-keeping or fulfilling a bulk data request.
                    </Typography>
                    <Alert severity="warning">
                        This file contains the entire roster&apos;s personal data. Handle and store it
                        securely, and delete it when it is no longer needed. Every export is recorded in
                        the audit log.
                    </Alert>
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={download.isPending ? <CircularProgress size={18} color="inherit"/> : <DownloadIcon/>}
                            onClick={handleDownload}
                            disabled={download.isPending}
                        >
                            {download.isPending ? 'Preparing…' : 'Download roster export'}
                        </Button>
                    </div>
                </Stack>
            </CardContent>
        </Card>
    );
}
