'use client';
import React from 'react';
import {useParams} from "next/navigation";
import {
    Alert,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {useJobDetail} from "@/lib/osmium/hooks/jobs";
import {jobLabel} from "@/lib/jobs";
import JobStatusCard from "@/components/Admin/JobStatusCard";
import {getTimeAgo} from "@/lib/date";

export default function Page() {
    const params = useParams<{ jobName: string }>();
    const jobName = params.jobName;
    const {data, isLoading, isError} = useJobDetail(jobName);

    return (
        <Grid container columns={12} spacing={2}>
            <Grid size={12}>
                <Typography variant="h5">{jobLabel(jobName)}</Typography>
            </Grid>
            {isLoading && <Grid size={12}><CircularProgress/></Grid>}
            {isError && <Grid size={12}><Alert severity="error">Failed to load job detail.</Alert></Grid>}
            {data && <>
                <Grid size={{xs: 12, md: 6, lg: 4}}>
                    <JobStatusCard job={data.status}/>
                </Grid>
                <Grid size={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{mb: 2,}}>Recent Runs</Typography>
                            {data.recent_runs.length === 0 &&
                                <Typography>No recorded runs for this job yet.</Typography>}
                            {data.recent_runs.length > 0 && <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Started</TableCell>
                                            <TableCell>Finished</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Error</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.recent_runs.map((run) => (
                                            <TableRow key={run.id}>
                                                <TableCell>{getTimeAgo(new Date(run.started_at))}</TableCell>
                                                <TableCell>{run.finished_at ? getTimeAgo(new Date(run.finished_at)) : '—'}</TableCell>
                                                <TableCell>
                                                    <Chip size="small" label={run.status}
                                                          color={run.status === 'succeeded' ? 'success' : run.status === 'failed' ? 'error' : 'default'}/>
                                                </TableCell>
                                                <TableCell>{run.error_text || '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>}
                        </CardContent>
                    </Card>
                </Grid>
            </>}
        </Grid>
    );
}
