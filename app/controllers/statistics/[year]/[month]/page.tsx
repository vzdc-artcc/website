'use client';
import React from 'react';
import {getMonth} from "@/lib/date";
import {Box, Card, CardContent, Grid, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import {StackedLineChart} from "@mui/icons-material";
import StatisticsTable from "@/components/Statistics/StatisticsTable";
import {useArtccStats} from "@/lib/osmium/hooks/stats";
import {useParams} from "next/navigation";

export default function Page() {
    const params = useParams();
    const year = params.year as string;
    const month = params.month as string;

    if (!Number(year) || Number(year) < 2000 || Number(year) > new Date().getFullYear() || Number(month) < 0 || Number(month) > 11) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Invalid Timeframe</Typography>
                    <Typography sx={{mt: 1,}}>Year must be after 2000 and not after this year. Month must also be within
                        0-11 range.</Typography>
                </CardContent>
            </Card>
        );
    }

    const {data} = useArtccStats({year: Number(year), month: Number(month) + 1});

    if (!data) {
        return null;
    }

    const controllerLog = data.controllers.map((c) => ({
        title: `${c.name} (${c.cid})`,
        delivery_hours: c.delivery_hours,
        ground_hours: c.ground_hours,
        tower_hours: c.tower_hours,
        tracon_hours: c.tracon_hours,
        center_hours: c.center_hours,
        total_hours: c.total_hours,
    }));

    return (
        (<Grid container columns={30} spacing={2}>
            <Grid size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h4">{getMonth(parseInt(month))}, {year} Statistics</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Delivery Hours</Typography>
                        <Typography variant="h6">{data.summary.delivery_hours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Ground Hours</Typography>
                        <Typography variant="h6">{data.summary.ground_hours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Tower Hours</Typography>
                        <Typography variant="h6">{data.summary.tower_hours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>TRACON Hours</Typography>
                        <Typography variant="h6">{data.summary.tracon_hours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Center Hours</Typography>
                        <Typography variant="h6">{data.summary.center_hours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 30,
                    sm: 15,
                    md: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Total Hours</Typography>
                        <Typography variant="h6">{data.summary.active_hours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid>
            {data.leaders.map((leader) => (
                <Grid
                    key={leader.cid}
                    size={{
                        xs: 30,
                        md: 10
                    }}>
                    <Card>
                        <CardContent>
                            <Box sx={{mb: 2,}}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="h5">{leader.rank} - {leader.name}</Typography>
                                    <Tooltip title="View Statistics for this controller">
                                        <Link href={`/controllers/statistics/${year}/${month}/${leader.cid}`}>
                                            <IconButton size="large">
                                                <StackedLineChart fontSize="large"/>
                                            </IconButton>
                                        </Link>
                                    </Tooltip>
                                </Stack>
                                <Typography variant="body1">{leader.rating} • {leader.cid}</Typography>
                            </Box>
                            <Typography variant="h6">{leader.online_hours.toPrecision(3)} hours</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            <Grid size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Controller Totals</Typography>
                        <StatisticsTable heading="Controller" logs={controllerLog}/>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>)
    );
}
