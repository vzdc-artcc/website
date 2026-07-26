"use client";

import {Card, CardContent, Chip, Typography} from "@mui/material";
import {useJobs} from "@/lib/osmium/hooks/jobs";
import {getChipColor, getMinutesAgo} from "@/lib/date";

export default function SyncStatusChip({jobName, label}: { jobName: string, label: string }) {
    const {data: jobs} = useJobs();
    const job = jobs?.find((j) => j.job_name === jobName);
    const lastSuccessAt = job?.last_success_at ? new Date(job.last_success_at) : undefined;

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography sx={{mb: 1,}}>{label}</Typography>
                <Chip label={lastSuccessAt ? `${getMinutesAgo(lastSuccessAt)}m ago` : 'NEVER'}
                      color={getChipColor(lastSuccessAt)}/>
            </CardContent>
        </Card>
    );
}
