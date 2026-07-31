'use client';
import React from 'react';
import {Card, CardContent, Grid, Typography} from "@mui/material";
import {getMonth} from "@/lib/date";
import SyncStatusChip from "@/components/Admin/SyncStatusChip";
import RecentAuditActivity from "@/components/Logs/RecentAuditActivity";
import {useRosterControllers, useUsersByRole} from "@/lib/osmium/hooks/users";
import {useArtccStats} from "@/lib/osmium/hooks/stats";

export default function Page() {

    const now = new Date();
    const {data: rosterData} = useRosterControllers();
    const {data: instructors} = useUsersByRole("INS");
    const {data: mentors} = useUsersByRole("MTR");
    const {data: stats} = useArtccStats({year: now.getFullYear(), month: now.getMonth() + 1});

    const controllers = rosterData?.items ?? [];
    const home = controllers.filter((c) => c.full?.controller_status === "HOME").length;
    const visitors = controllers.filter((c) => c.full?.controller_status === "VISITOR").length;

    const trainingStaffCids = new Set<number>();
    for (const u of [...(instructors?.items ?? []), ...(mentors?.items ?? [])]) trainingStaffCids.add(u.basic.cid);
    const trainingStaff = trainingStaffCids.size;

    const monthHours = stats?.summary?.total_hours ? stats.summary.total_hours.toFixed(2) : '—';

    return (
        (<Grid container columns={20} spacing={2}>
            <Grid size={{xs: 20, md: 10, lg: 5}}>
                <Card><CardContent>
                    <Typography>Membership</Typography>
                    <Typography variant="h4">{home + visitors}</Typography>
                </CardContent></Card>
            </Grid>
            <Grid size={{xs: 20, md: 10, lg: 5}}>
                <Card><CardContent>
                    <Typography>Visitors</Typography>
                    <Typography variant="h4">{visitors}</Typography>
                </CardContent></Card>
            </Grid>
            <Grid size={{xs: 20, md: 10, lg: 5}}>
                <Card><CardContent>
                    <Typography>Training Staff</Typography>
                    <Typography variant="h4">{trainingStaff}</Typography>
                </CardContent></Card>
            </Grid>
            <Grid size={{xs: 20, md: 10, lg: 5}}>
                <Card><CardContent>
                    <Typography>{getMonth(now.getMonth())} Hours</Typography>
                    <Typography variant="h4">{monthHours}</Typography>
                </CardContent></Card>
            </Grid>
            <Grid size={{xs: 20, md: 10, lg: 4}}><SyncStatusChip jobName="roster_sync" label="Roster Sync"/></Grid>
            <Grid size={{xs: 20, md: 10, lg: 4}}><SyncStatusChip jobName="stats_sync" label="Statistics Sync"/></Grid>
            <Grid size={{xs: 20, md: 10, lg: 4}}><SyncStatusChip jobName="solo_expiration" label="Solo Endorsement Sync"/></Grid>
            <Grid size={{xs: 20, md: 10, lg: 4}}><SyncStatusChip jobName="event_automation" label="Events Sync"/></Grid>
            <Grid size={{xs: 20, md: 10, lg: 4}}><SyncStatusChip jobName="loa_expiration" label="LOA Sync"/></Grid>
            <Grid size={20}>
                <RecentAuditActivity domain="facility" href="/admin/logs"/>
            </Grid>
        </Grid>)
    );
}
