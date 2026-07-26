'use client';
import React, {useState} from 'react';
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {PlayArrow} from "@mui/icons-material";
import {toast} from "react-toastify";
import {useOutboundJobs, useRunOutboundJobs} from "@/lib/osmium/hooks/outbound-jobs";
import {getTimeAgo, getTimeIn} from "@/lib/date";

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
    delivered: 'success',
    pending: 'default',
    retry: 'warning',
    failed: 'error',
};

export default function Page() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const {data, isLoading, isError} = useOutboundJobs({page, pageSize: 25, status: status || undefined});
    const runJobs = useRunOutboundJobs();

    const handleRun = async () => {
        try {
            const result = await runJobs.mutateAsync();
            const delivered = result?.filter((r) => r.status === 'delivered').length ?? 0;
            const retried = result?.filter((r) => r.status !== 'delivered').length ?? 0;
            toast(`Ran ${result?.length ?? 0} job(s): ${delivered} delivered, ${retried} will retry.`, {type: 'success'});
        } catch {
            toast('Failed to run outbound jobs.', {type: 'error'});
        }
    };

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Typography variant="h5" fontWeight={700}>Outbound Jobs</Typography>
                        <Typography variant="body2" color="text.secondary">Queued outbound integration jobs and their status.</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <TextField variant="filled" size="small" label="Status" value={status}
                                       onChange={(e) => {
                                           setStatus(e.target.value);
                                           setPage(1);
                                       }}/>
                            <Button variant="contained" startIcon={<PlayArrow/>} onClick={handleRun}
                                    disabled={runJobs.isPending}>
                                Run Pending
                            </Button>
                        </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{mt: 1,}}>
                        Discord-bound integration jobs (event position publishes, announcements) queued
                        durably and delivered here. Separate from Background Jobs.
                    </Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    {isLoading && <CircularProgress/>}
                    {isError && <Alert severity="error">Failed to load outbound jobs.</Alert>}
                    {data && data.items.length === 0 && <Typography>No outbound jobs found.</Typography>}
                    {data && data.items.length > 0 && (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Job Type</TableCell>
                                        <TableCell>Subject</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Attempts</TableCell>
                                        <TableCell>Next Attempt</TableCell>
                                        <TableCell>Error</TableCell>
                                        <TableCell>Created</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.job_type}</TableCell>
                                            <TableCell>
                                                {item.subject_type ? `${item.subject_type}${item.subject_id ? ` (${item.subject_id})` : ''}` : '—'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" label={item.status}
                                                      color={STATUS_COLOR[item.status] ?? 'default'}/>
                                            </TableCell>
                                            <TableCell>{item.attempt_count}</TableCell>
                                            <TableCell>{item.next_attempt_at ? getTimeIn(new Date(item.next_attempt_at)) : '—'}</TableCell>
                                            <TableCell>{item.error || '—'}</TableCell>
                                            <TableCell>{getTimeAgo(new Date(item.created_at))}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    {data && (
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt: 2,}}>
                            <Button disabled={!data.has_prev} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                            <Typography variant="body2">Page {data.page} of {data.total_pages}</Typography>
                            <Button disabled={!data.has_next} onClick={() => setPage((p) => p + 1)}>Next</Button>
                        </Stack>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
}
