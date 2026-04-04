import prisma from "@/lib/db";
import Link from "next/link";
import {
    Card,
    CardContent,
    Grid,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import {Article, Checklist, Edit, Info} from "@mui/icons-material";
import {eventGetDuration, getTimeAgo} from "@/lib/date";
import {EVENT_ONLY_LOG_MODELS} from "@/lib/log";

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
        <Grid container columns={2} spacing={2}>
            <Grid size={{xs: 2, md: 1,}}>
                <Card sx={{ height: '100%', }}>
                    <CardContent>
                        <Typography>Upcoming Unarchived Events (30 days)</Typography>
                        <Typography variant="h4">{upcomingEvents.length}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 2, md: 1,}}>
                <Card sx={{ height: '100%', }}>
                    <CardContent>
                        <Typography>Next Event</Typography>
                        { upcomingEvents[0] && 
                        <>
                            <Stack direction="row" alignItems="center">
                                <Typography variant="h4" sx={{ mr: 1, }}>{upcomingEvents[0].name || 'N/A'}</Typography>
                                {upcomingEvents[0].hidden ? (
                                    <IconButton disabled>
                                        <Info />
                                    </IconButton>
                                ) : (
                                    <Link href={`/events/${upcomingEvents[0].id}`} style={{ color: 'inherit', textDecoration: 'none', }}>
                                        <IconButton>
                                            <Info />
                                        </IconButton>
                                    </Link>
                                )}
                                <Tooltip title={
                                    upcomingEvents[0].hidden ? 'You must show the event to view information.'
                                        : (!upcomingEvents[0].opsPlanPublished ? 'You must publish the OPS Plan to view.' : 'OPS Plan Page')
                                }>
                                    {(upcomingEvents[0].hidden || !upcomingEvents[0].opsPlanPublished) ? (
                                        <span>
                                            <IconButton disabled>
                                                <Article/>
                                            </IconButton>
                                        </span>
                                    ) : (
                                        <Link href={`/events/${upcomingEvents[0].id}/ops`} passHref style={{ color: 'inherit', textDecoration: 'none', }}>
                                            <IconButton>
                                                <Article/>
                                            </IconButton>
                                        </Link>
                                    )}
                                </Tooltip>
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
            </Grid>
            <Grid size={2}>
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
            </Grid>
        </Grid>
    )
}