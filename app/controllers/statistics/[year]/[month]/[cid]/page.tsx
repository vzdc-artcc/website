'use client';
import React from 'react';
import {getMonth} from "@/lib/date";
import {Card, CardContent, Grid, Typography} from "@mui/material";
import StatisticsTable from "@/components/Statistics/StatisticsTable";
import ControllingSessionsTable from "@/components/Statistics/ControllingSessionsTable";
import {useControllerHistory, useControllerPositions, useControllerTotals} from "@/lib/osmium/hooks/stats";
import {useParams} from "next/navigation";

export default function Page() {
    const params = useParams();
    const year = params.year as string;
    const month = params.month as string;
    const cid = params.cid as string;

    const isAllMonths = isNaN(parseInt(month));

    if (!Number(year) || Number(year) < 2000 || Number(year) > new Date().getFullYear() || (!isAllMonths && (Number(month) < 0 || Number(month) > 11))) {
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

    const cidNum = Number(cid);

    const {data: totals, isError, isLoading} = useControllerTotals(cidNum);
    const {data: history} = useControllerHistory(cidNum, Number(year));
    const {data: positions} = useControllerPositions(cidNum, {
        year: Number(year),
        month: isAllMonths ? undefined : Number(month) + 1,
    });

    if (isError) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h4">Controller Not Found</Typography>
                    <Typography sx={{mt: 1,}}>No controller found for CID {cid}.</Typography>
                </CardContent>
            </Card>
        );
    }

    if (isLoading || !totals) {
        return null;
    }

    const monthLog = (history?.months ?? []).map((m) => ({
        title: getMonth(m.month - 1),
        delivery_hours: m.delivery_hours,
        ground_hours: m.ground_hours,
        tower_hours: m.tower_hours,
        tracon_hours: m.tracon_hours,
        center_hours: m.center_hours,
        total_hours: m.total_hours,
    }));

    // controller/totals is always all-time — the 6 summary cards below need to
    // reflect the viewed year (or year+month), so they're derived from
    // history's monthly buckets instead, matching this page's original
    // year/month-scoped behavior.
    const relevantMonths = isAllMonths
        ? (history?.months ?? [])
        : (history?.months ?? []).filter((m) => m.month === Number(month) + 1);

    const summary = relevantMonths.reduce((acc, m) => ({
        delivery_hours: acc.delivery_hours + m.delivery_hours,
        ground_hours: acc.ground_hours + m.ground_hours,
        tower_hours: acc.tower_hours + m.tower_hours,
        tracon_hours: acc.tracon_hours + m.tracon_hours,
        center_hours: acc.center_hours + m.center_hours,
        active_hours: acc.active_hours + m.active_hours,
    }), {delivery_hours: 0, ground_hours: 0, tower_hours: 0, tracon_hours: 0, center_hours: 0, active_hours: 0});

    return (
        (<Grid container columns={30} spacing={2}>
            <Grid size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">{totals.name}</Typography>
                        <Typography>{totals.rating} • {totals.cid}</Typography>
                        <Typography>{!isAllMonths && `${getMonth(parseInt(month))}, `}{year} Statistics</Typography>
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
                        <Typography variant="h6">{summary.delivery_hours.toPrecision(3)} hours</Typography>
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
                        <Typography variant="h6">{summary.ground_hours.toPrecision(3)} hours</Typography>
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
                        <Typography variant="h6">{summary.tower_hours.toPrecision(3)} hours</Typography>
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
                        <Typography variant="h6">{summary.tracon_hours.toPrecision(3)} hours</Typography>
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
                        <Typography variant="h6">{summary.center_hours.toPrecision(3)} hours</Typography>
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
                        <Typography variant="h6">{summary.active_hours.toPrecision(3)} hours</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Controlling Sessions</Typography>
                        <ControllingSessionsTable positions={positions?.items ?? []}/>
                    </CardContent>
                </Card>
            </Grid>
            {isAllMonths && <Grid size={30}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">Monthly Totals</Typography>
                        <StatisticsTable heading="Month" logs={monthLog}/>
                    </CardContent>
                </Card>
            </Grid>}
        </Grid>)
    );
}
