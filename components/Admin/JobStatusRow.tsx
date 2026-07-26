'use client';
import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import {ErrorOutline, PlayArrow} from "@mui/icons-material";
import Link from "next/link";
import {getChipColor, getTimeAgo} from "@/lib/date";
import {jobLabel, RUNNABLE_JOBS} from "@/lib/jobs";
import {useRunJob} from "@/lib/osmium/hooks/jobs";
import type {components} from "@/lib/osmium/generated/schema";

export default function JobStatusRow({job}: { job: components["schemas"]["JobStatusItem"] }) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const runJob = useRunJob();
    const runnable = RUNNABLE_JOBS.has(job.job_name);
    const failed = job.last_result_ok === false;

    const handleRun = () => {
        runJob.mutate(job.job_name, {onSuccess: () => setConfirmOpen(false)});
    };

    return (
        <>
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{py: 1.25, flexWrap: 'wrap'}}
            >
                <Box sx={{flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 1}}>
                    {failed && (
                        <Tooltip title={job.last_error || 'Last run failed'}>
                            <ErrorOutline color="error" fontSize="small"/>
                        </Tooltip>
                    )}
                    <Link href={`/website-management/jobs/${job.job_name}`}
                          style={{textDecoration: 'none', color: 'inherit'}}>
                        <Typography variant="subtitle1" fontWeight={500} sx={{'&:hover': {textDecoration: 'underline'}}}>
                            {jobLabel(job.job_name)}
                        </Typography>
                    </Link>
                </Box>

                <Chip size="small" label={job.enabled ? 'Enabled' : 'Disabled'}
                      color={job.enabled ? 'success' : 'default'}
                      variant={job.enabled ? 'filled' : 'outlined'}/>

                <Chip
                    size="small"
                    variant="outlined"
                    label={job.last_success_at ? `Last success ${getTimeAgo(new Date(job.last_success_at))}` : 'Never succeeded'}
                    color={getChipColor(job.last_success_at ? new Date(job.last_success_at) : null)}
                />

                <Tooltip title={runnable ? '' : 'Runs continuously in the background and cannot be triggered manually.'}>
                    <span>
                        <Button variant="outlined" size="small" startIcon={<PlayArrow/>}
                                disabled={!runnable || runJob.isPending}
                                onClick={() => setConfirmOpen(true)}>
                            Run
                        </Button>
                    </span>
                </Tooltip>
            </Stack>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Run {jobLabel(job.job_name)} now?</DialogTitle>
                <DialogContent>
                    <Typography>This will trigger an immediate manual run of this job.</Typography>
                    {runJob.isError && <Alert severity="error" sx={{mt: 2}}>Failed to trigger job.</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRun} disabled={runJob.isPending}>Run Now</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
