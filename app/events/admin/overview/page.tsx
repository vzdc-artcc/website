import prisma from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, Grid2, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Checklist, Edit, Info } from "@mui/icons-material";
import { eventGetDuration, getDuration, getTimeAgo } from "@/lib/date";
import { EVENT_ONLY_LOG_MODELS } from "@/lib/log";

export default async function Page() {

    const upcomingEvents = await prisma.event.findMany({
        where: {
            start: {
                gte: new Date(),
                lte: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
            archived: null,
        },
        orderBy: {
            start: 'asc',
        },
    });

    const recentLogs = await prisma.log.findMany({
        take: 10,
        where: {
            model: {
                in: EVENT_ONLY_LOG_MODELS,
            }
        },
        orderBy: {
            timestamp: 'desc'
        },
        include: {
            user: true
        },
    });

    return (
        <Grid2 container columns={2} spacing={2}>
            <Grid2 size={{ xs: 2, md: 1, }}>
                <Card sx={{ height: '100%', }}>
                    <CardContent>
                        <Typography>Upcoming Unarchived Events (30 days)</Typography>
                        <Typography variant="h4">{upcomingEvents.length}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={{ xs: 2, md: 1, }}>
                <Card sx={{ height: '100%', }}>
                    <CardContent>
                        <Typography>Next Event</Typography>
                        { upcomingEvents[0] && 
                        <>
                            <Stack direction="row" alignItems="center">
                                <Typography variant="h4" sx={{ mr: 1, }}>{upcomingEvents[0].name || 'N/A'}</Typography>
                                <Link href={upcomingEvents[0].hidden ? '' : `/events/${upcomingEvents[0].id}`} style={{ color: 'inherit', textDecoration: 'none', }}>
                                    <IconButton disabled={upcomingEvents[0].hidden}>
                                        <Info />
                                    </IconButton>
                                </Link>
                                <Link href={`/events/admin/events/${upcomingEvents[0].id}/manager`} style={{ color: 'inherit', textDecoration: 'none', }}>
                                    <IconButton>
                                        <Checklist />
                                    </IconButton>
                                </Link>
                                <Link href={`/events/admin/events/${upcomingEvents[0].id}`} style={{ color: 'inherit', textDecoration: 'none', }}>
                                    <IconButton>
                                        <Edit />
                                    </IconButton>
                                </Link>
                            </Stack>
                            <Typography>In {eventGetDuration(new Date(), upcomingEvents[0].start, true).toFixed(0)} days</Typography>
                        </> }
                        { !upcomingEvents[0] && <Typography variant="h4">N/A</Typography> }
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={2}>
            <Card>
                    <CardContent>
                        <Typography variant="h5">Recent Events Activity</Typography>
                        {recentLogs.length === 0 && <Typography sx={{mt: 1,}}>No recent events activity</Typography>}
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
        </Grid2>
    )
}