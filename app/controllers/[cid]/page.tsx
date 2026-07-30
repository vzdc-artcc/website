import React from 'react';
import {notFound} from "next/navigation";
import {Card, CardContent, Grid, Typography} from "@mui/material";
import PublicProfileCard from "@/components/Profile/PublicProfileCard";
import StatisticsTable from "@/components/Statistics/StatisticsTable";
import ControllingSessionsTable from "@/components/Statistics/ControllingSessionsTable";
import {getMonth} from "@/lib/date";
import {osmium} from "@/lib/osmium/client";

export default async function Page(props: { params: Promise<{ cid: string }> }) {

    const params = await props.params;

    const {cid} = params;
    const cidNum = Number(cid);

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Public, unauthenticated osmium endpoints — safe to call server-side.
    const [{data: userData}, {data: history}, {data: positions}] = await Promise.all([
        osmium.GET("/api/v1/users/{cid}", {
            params: {path: {cid: cidNum}},
        }),
        osmium.GET("/api/v1/stats/controller/{cid}/history", {
            params: {path: {cid: cidNum}, query: {year}},
        }),
        osmium.GET("/api/v1/stats/controller/{cid}/positions", {
            params: {path: {cid: cidNum}, query: {year, month, page_size: 500}},
        }),
    ]);

    if (!userData) {
        notFound();
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

    return (
        (<Grid container columns={2} spacing={2}>
            <Grid size={2}>
                <PublicProfileCard cid={cidNum}/>
            </Grid>
            <Grid
                size={{
                    xs: 2,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">{year} Statistics</Typography>
                        <StatisticsTable heading="Month" logs={monthLog}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid
                size={{
                    xs: 2,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">{getMonth(month - 1)} Controlling Sessions</Typography>
                        <ControllingSessionsTable positions={positions?.items ?? []}/>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>)
    );
}