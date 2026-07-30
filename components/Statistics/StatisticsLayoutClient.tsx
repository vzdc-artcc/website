'use client';
import React from 'react';
import {Card, CardContent, Container, Grid, Stack, Typography} from "@mui/material";
import StatisticsTimeSelector from "@/components/Statistics/StatisticsTimeSelector";
import {useArtccStats} from "@/lib/osmium/hooks/stats";

export default function StatisticsLayoutClient({children}: { children: React.ReactNode }) {

    const {data} = useArtccStats({allTime: true, limit: 500});

    const controllers = (data?.controllers ?? []).map((c) => ({cid: c.cid, name: c.name}));
    const allTimeHours = data?.summary.active_hours ?? 0;

    return (
        (<Container maxWidth="lg">
            <Stack direction="column" spacing={2}>
                <Grid container columns={4} spacing={2}>
                    <Grid
                        size={{
                            xs: 4,
                            sm: 2,
                            md: 3
                        }}>
                        <StatisticsTimeSelector controllers={controllers}/>
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
                                <Typography variant="h6">{allTimeHours.toFixed(3)} hours</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={4}>
                        {children}
                    </Grid>
                </Grid>
            </Stack>
        </Container>)
    );
}
