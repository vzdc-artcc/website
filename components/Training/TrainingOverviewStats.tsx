'use client';
import React from 'react';
import {Card, CardContent, Grid, Typography} from "@mui/material";
import {getMonth} from "@/lib/date";
import {useTrainingSessions} from "@/lib/osmium/hooks/training";

export default function TrainingOverviewStats() {
    const {data} = useTrainingSessions({pageSize: 200});
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sessions = (data?.items ?? []).filter((session) => {
        const start = new Date(session.start);
        return start >= startOfMonth && start <= endOfMonth;
    });

    const totalHours = sessions.reduce((sum, session) => {
        const duration = (new Date(session.end).getTime() - new Date(session.start).getTime()) / (1000 * 60 * 60);
        return sum + duration;
    }, 0).toFixed(3);

    return (
        <>
            <Grid size={{xs: 4, md: 2, lg: 1}}>
                <Card>
                    <CardContent>
                        <Typography>{getMonth(now.getMonth())} Sessions</Typography>
                        <Typography variant="h4">{sessions.length}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 4, md: 2, lg: 1}}>
                <Card>
                    <CardContent>
                        <Typography>{getMonth(now.getMonth())} Training Hours</Typography>
                        <Typography variant="h4">{totalHours}</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </>
    );
}
