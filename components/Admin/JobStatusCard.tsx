'use client';
import React, {useState} from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import {PlayArrow} from "@mui/icons-material";
import Link from "next/link";
import {getChipColor, getTimeAgo} from "@/lib/date";
import {jobLabel, RUNNABLE_JOBS} from "@/lib/jobs";
import {useRunJob} from "@/lib/osmium/hooks/jobs";
import type {components} from "@/lib/osmium/generated/schema";

export default function JobStatusCard({job, linkToDetail}: {
    job: components["schemas"]["JobStatusItem"],
    linkToDetail?: boolean
}) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const runJob = useRunJob();
    const runnable = RUNNABLE_JOBS.has(job.job_name);

    const handleRun = () => {
        runJob.mutate(job.job_name, {
            onSuccess: () => setConfirmOpen(false),
        });
    };

    const title = linkToDetail
        ? <Link href={`/website-management/jobs/${job.job_name}`} style={{textDecoration: 'none', color: 'inherit',}}>
            <Typography variant="h6">{jobLabel(job.job_name)}</Typography>
        </Link>
        : <Typography variant="h6">{jobLabel(job.job_name)}</Typography>;

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    {title}
                    <Chip size="small" label={job.enabled ? 'Enabled' : 'Disabled'}
                          color={job.enabled ? 'success' : 'default'}/>
                </Stack>
                <Box sx={{mt: 1,}}>
                    <Chip
                        label={job.last_success_at ? `Last success ${getTimeAgo(new Date(job.last_success_at))}` : 'Never succeeded'}
                        color={getChipColor(job.last_success_at ? new Date(job.last_success_at) : null)}/>
                </Box>
                {job.last_result_ok === false &&
                    <Alert severity="error" sx={{mt: 1,}}>{job.last_error || 'Last run failed'}</Alert>}
                <Box sx={{mt: 2,}}>
                    <Tooltip
                        title={runnable ? '' : 'This job runs continuously in the background and cannot be triggered manually.'}>
                        <span>
                            <Button variant="outlined" size="small" startIcon={<PlayArrow/>}
                                    disabled={!runnable || runJob.isPending}
                                    onClick={() => setConfirmOpen(true)}>
                                Run Now
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            </CardContent>
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Run {jobLabel(job.job_name)} now?</DialogTitle>
                <DialogContent>
                    <Typography>This will trigger an immediate manual run of this job.</Typography>
                    {runJob.isError && <Alert severity="error" sx={{mt: 2,}}>Failed to trigger job.</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleRun} disabled={runJob.isPending}>
                        Run Now
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
