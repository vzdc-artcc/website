'use client';

import React from 'react';
import {Card, CardContent, Container, Grid, Stack, Typography} from "@mui/material";
import TrainingStatsTimeSelector from "@/components/TrainingStatistics/TrainingStatsTimeSelector";
import {useTrainingStaff} from "@/lib/osmium/hooks/users";
import {useAllTimeTrainingHours} from "@/lib/osmium/hooks/training";

/**
 * Client shell for the training-statistics layout: self-sources the
 * mentor/instructor selector list and the all-time-hours card from osmium,
 * replacing the former Prisma-backed server layout.
 */
export default function TrainingStatsLayoutShell({children}: { children: React.ReactNode }) {
    const {data: trainingStaff} = useTrainingStaff();
    const {data: totalHours} = useAllTimeTrainingHours();

    return (
        <Container maxWidth="lg">
            <Stack direction="column" spacing={2}>
                <Grid container columns={4} spacing={2}>
                    <Grid
                        size={{
                            xs: 4,
                            sm: 2,
                            md: 3
                        }}>
                        <TrainingStatsTimeSelector trainingStaff={trainingStaff}/>
                    </Grid>
                    <Grid
                        size={{
                            xs: 4,
                            sm: 2,
                            md: 1
                        }}>
                        <Card>
                            <CardContent>
                                <Typography>All-Time Hours</Typography>
                                <Typography variant="h6">{(totalHours ?? 0).toFixed(2)} hours</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={4}>
                        {children}
                    </Grid>
                </Grid>
            </Stack>
        </Container>
    );
}
