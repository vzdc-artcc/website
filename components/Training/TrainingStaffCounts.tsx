'use client';
import React from 'react';
import {Card, CardContent, Grid, Skeleton, Typography} from "@mui/material";
import {useUsersByRole} from "@/lib/osmium/hooks/users";

/**
 * Mentor/instructor headcount cards for the training overview, sourced from
 * osmium's role data (MTR/INS) instead of the frozen Prisma `user.roles`.
 * The `role=` filter on GET /api/v1/users checks the full role set and the
 * response's `total` is the count directly (no need to page through items).
 */
function CountCard({label, count, isLoading}: { label: string, count: number | undefined, isLoading: boolean }) {
    return (
        <Grid size={{xs: 4, md: 2, lg: 1}}>
            <Card>
                <CardContent>
                    <Typography>{label}</Typography>
                    {isLoading
                        ? <Skeleton variant="text" width={40} height={48}/>
                        : <Typography variant="h4">{count ?? 0}</Typography>}
                </CardContent>
            </Card>
        </Grid>
    );
}

export default function TrainingStaffCounts() {
    const {data: mentors, isLoading: mentorsLoading} = useUsersByRole("MTR");
    const {data: instructors, isLoading: instructorsLoading} = useUsersByRole("INS");

    return (
        <>
            <CountCard label="Mentors" count={mentors?.total} isLoading={mentorsLoading}/>
            <CountCard label="Instructors" count={instructors?.total} isLoading={instructorsLoading}/>
        </>
    );
}
