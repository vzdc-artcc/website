'use client';
import React from 'react';
import {Alert, Card, CardContent, CircularProgress, Divider, Stack, Typography} from "@mui/material";
import {useJobs} from "@/lib/osmium/hooks/jobs";
import JobStatusRow from "@/components/Admin/JobStatusRow";

export default function Page() {
    const {data: jobs, isLoading, isError} = useJobs();

    return (
        <Stack direction="column" spacing={2}>
            <Typography variant="h5" fontWeight={700}>Background Jobs</Typography>
            {isLoading && <CircularProgress/>}
            {isError && <Alert severity="error">Failed to load job statuses.</Alert>}
            {jobs && (
                <Card>
                    <CardContent>
                        {jobs.map((job, idx) => (
                            <React.Fragment key={job.job_name}>
                                {idx > 0 && <Divider/>}
                                <JobStatusRow job={job}/>
                            </React.Fragment>
                        ))}
                    </CardContent>
                </Card>
            )}
        </Stack>
    );
}
