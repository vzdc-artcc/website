'use client';
import React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {getMonth, getTimeAgo} from "@/lib/date";
import SyncStatusChip from "@/components/Admin/SyncStatusChip";
import {useRosterControllers, useUsersByRole} from "@/lib/osmium/hooks/users";
import {useArtccStats} from "@/lib/osmium/hooks/stats";
import {useAuditLogs} from "@/lib/osmium/hooks/audit";

export default function Page() {

    const now = new Date();
    const {data: rosterData} = useRosterControllers();
    const {data: instructors} = useUsersByRole("INS");
    const {data: mentors} = useUsersByRole("MTR");
    const {data: stats} = useArtccStats({year: now.getFullYear(), month: now.getMonth() + 1});
    const {data: auditData} = useAuditLogs({pageSize: 10});

    const controllers = rosterData?.items ?? [];
    const home = controllers.filter((c) => c.full?.controller_status === "HOME").length;
    const visitors = controllers.filter((c) => c.full?.controller_status === "VISITOR").length;

    const trainingStaffCids = new Set<number>();
    for (const u of [...(instructors?.items ?? []), ...(mentors?.items ?? [])]) trainingStaffCids.add(u.basic.cid);
    const trainingStaff = trainingStaffCids.size;

    const monthHours = stats?.summary?.total_hours ? stats.summary.total_hours.toFixed(2) : '—';
    const logs = auditData?.items ?? [];

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
                <Card>
                    <CardContent>
                        <Typography variant="h5">Recent Activity</Typography>
                        {logs.length === 0 && <Typography sx={{mt: 1,}}>No recent activity</Typography>}
                        {logs.length > 0 && <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Time</TableCell>
                                        <TableCell>Actor</TableCell>
                                        <TableCell>Action</TableCell>
                                        <TableCell>Resource</TableCell>
                                        <TableCell>ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{getTimeAgo(new Date(log.created_at))}</TableCell>
                                            <TableCell>{log.actor_display_name ?? log.actor_type}</TableCell>
                                            <TableCell>{log.action}</TableCell>
                                            <TableCell>{log.resource_type}</TableCell>
                                            <TableCell>{log.resource_id}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>)
    );
}
