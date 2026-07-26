'use client';
import React from 'react';
import {Alert, CircularProgress, Grid, Typography} from "@mui/material";
import {useJobs} from "@/lib/osmium/hooks/jobs";
import JobStatusCard from "@/components/Admin/JobStatusCard";

export default function Page() {
    const {data: jobs, isLoading, isError} = useJobs();

    return (
        <Grid container columns={12} spacing={2}>
            <Grid size={12}>
                <Typography variant="h5">Background Jobs</Typography>
            </Grid>
            {isLoading && <Grid size={12}><CircularProgress/></Grid>}
            {isError && <Grid size={12}><Alert severity="error">Failed to load job statuses.</Alert></Grid>}
            {jobs?.map((job) => (
                <Grid key={job.job_name} size={{xs: 12, md: 6, lg: 4}}>
                    <JobStatusCard job={job} linkToDetail/>
                </Grid>
            ))}
        </Grid>
    );
}
