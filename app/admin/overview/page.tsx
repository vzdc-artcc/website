import React from 'react';
import {
    Card,
    CardContent,
    Chip,
    Grid2,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import prisma from "@/lib/db";
import {getChipColor, getMinutesAgo, getMonth, getTimeAgo} from "@/lib/date";
import {getMonthHours} from "@/lib/hours";

export default async function Page() {

    const home = await prisma.user.count({
        where: {
            controllerStatus: "HOME",
        },
    });

    const visitors = await prisma.user.count({
        where: {
            controllerStatus: "VISITOR",
        },
    });

    const trainingStaff = await prisma.user.count({
        where: {
            roles: {
                hasSome: ["MENTOR", "INSTRUCTOR"],
            },
        },
    });

    const recentLogs = await prisma.log.findMany({
        take: 10,
        orderBy: {
            timestamp: 'desc'
        },
        include: {
            user: true
        },
    });

    const now = new Date();
    const monthHours = await getMonthHours(now.getMonth(), now.getFullYear());

    const syncTimes = await prisma.syncTimes.findFirst();

    return (
        (<Grid2 container columns={20} spacing={2}>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Membership</Typography>
                        <Typography variant="h4">{home + visitors}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Visitors</Typography>
                        <Typography variant="h4">{visitors}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>Training Staff</Typography>
                        <Typography variant="h4">{trainingStaff}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 5
                }}>
                <Card>
                    <CardContent>
                        <Typography>{getMonth(now.getMonth())} Hours</Typography>
                        <Typography variant="h4">{monthHours}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 4
                }}>
                <Card>
                    <CardContent>
                        <Typography sx={{mb: 1,}}>Roster Sync</Typography>
                        <Chip label={syncTimes?.roster ? `${getMinutesAgo(syncTimes?.roster)}m ago` : 'NEVER'}
                              color={getChipColor(syncTimes?.roster)}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 4
                }}>
                <Card>
                    <CardContent>
                        <Typography sx={{mb: 1,}}>Statistics Sync</Typography>
                        <Chip label={syncTimes?.stats ? `${getMinutesAgo(syncTimes?.stats)}m ago` : 'NEVER'}
                              color={getChipColor(syncTimes?.stats)}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 4
                }}>
                <Card>
                    <CardContent>
                        <Typography sx={{mb: 1,}}>Solo Certification Sync</Typography>
                        <Chip label={syncTimes?.soloCert ? `${getMinutesAgo(syncTimes?.soloCert)}m ago` : 'NEVER'}
                              color={getChipColor(syncTimes?.soloCert)}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 4
                }}>
                <Card>
                    <CardContent>
                        <Typography sx={{mb: 1,}}>Events Sync</Typography>
                        <Chip label={syncTimes?.events ? `${getMinutesAgo(syncTimes?.events)}m ago` : 'NEVER'}
                              color={getChipColor(syncTimes?.events)}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 20,
                    md: 10,
                    lg: 4
                }}>
                <Card>
                    <CardContent>
                        <Typography sx={{mb: 1,}}>LOA Sync</Typography>
                        <Chip label={syncTimes?.loas ? `${getMinutesAgo(syncTimes?.loas)}m ago` : 'NEVER'}
                              color={getChipColor(syncTimes?.loas)}/>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={20}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Recent Activity</Typography>
                        {recentLogs.length === 0 && <Typography sx={{mt: 1,}}>No recent activity</Typography>}
                        {recentLogs.length > 0 && <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Time</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Model</TableCell>
                                        <TableCell>Message</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{getTimeAgo(log.timestamp)}</TableCell>
                                            <TableCell>{log.user.cid} ({log.user.fullName})</TableCell>
                                            <TableCell>{log.type}</TableCell>
                                            <TableCell>{log.model}</TableCell>
                                            <TableCell>{log.message}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>}

                    </CardContent>
                </Card>
            </Grid2>
        </Grid2>)
    );
}