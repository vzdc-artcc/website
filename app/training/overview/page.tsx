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
import {getChipColor, getMinutesAgo, getMonth, getTimeAgo, getTimeIn} from "@/lib/date";
import prisma from "@/lib/db";
import {TRAINING_ONLY_LOG_MODELS} from "@/lib/log";
import {Lesson} from "@prisma/client";
import {Info, PendingOutlined} from "@mui/icons-material";

export default async function Page() {

    const now = new Date();
    const users = await prisma.user.findMany();

    const mentors = users.filter(user => user.roles.includes('MENTOR'));
    const instructors = users.filter(user => user.roles.includes('INSTRUCTOR'));

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sessions = await prisma.trainingSession.findMany({
        where: {
            start: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    const totalHours = sessions.reduce((sum, session) => {
        const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60); // convert milliseconds to hours
        return sum + duration;
    }, 0).toFixed(3);

    const recentLogs = await prisma.log.findMany({
        take: 10,
        where: {
            model: {
                in: TRAINING_ONLY_LOG_MODELS,
            }
        },
        orderBy: {
            timestamp: 'desc'
        },
        include: {
            user: true
        },
    });

    const upcomingAppointments = await prisma.trainingAppointment.findMany({
        where: {
            start: {
                gte: now
            }
        },
        orderBy: {
            start: 'asc'
        },
        take: 5,
        include: {
            student: true,
            trainer: true,
            lessons: true,
        },
    });

    const syncTimes = await prisma.syncTimes.findFirst();

    return (
        (<Grid2 container columns={4} spacing={2}>
            <Grid2
                size={{
                    xs: 4,
                    md: 2,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography>Mentors</Typography>
                        <Typography variant="h4">{mentors.length}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 4,
                    md: 2,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography>Instructors</Typography>
                        <Typography variant="h4">{instructors.length}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 4,
                    md: 2,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography>{getMonth(now.getMonth())} Sessions</Typography>
                        <Typography variant="h4">{sessions.length}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2
                size={{
                    xs: 4,
                    md: 2,
                    lg: 1
                }}>
                <Card>
                    <CardContent>
                        <Typography>{getMonth(now.getMonth())} Training Hours</Typography>
                        <Typography variant="h4">{totalHours}</Typography>
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={{xs: 4,}}>
                <Card>
                    <CardContent>
                        <Typography sx={{mb: 1,}}>Appointments Sync</Typography>
                        <Chip
                            label={syncTimes?.appointments ? `${getMinutesAgo(syncTimes.appointments)}m ago` : 'NEVER'}
                            color={getChipColor(syncTimes?.appointments)}/>
                    </CardContent>
                </Card>
            </Grid2>

            <Grid2
                size={{
                    xs: 4,
                }}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>Upcoming Sessions</Typography>
                        {upcomingAppointments.length === 0 &&
                            <Typography>No upcoming training appointments.</Typography>}
                        {upcomingAppointments.length > 0 &&
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Trainer</TableCell>
                                            <TableCell>Student</TableCell>
                                            <TableCell>Start</TableCell>
                                            <TableCell>Duration</TableCell>
                                            <TableCell>Environment</TableCell>
                                            <TableCell>Lesson(s)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {upcomingAppointments.map((appointment) => (
                                            <TableRow key={appointment.id}>
                                                <TableCell>
                                                    <Chip
                                                        label={`${appointment.trainer.firstName} ${appointment.trainer.lastName}` || 'Unknown'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={`${appointment.student.firstName} ${appointment.student.lastName}` || 'Unknown'}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>{getTimeIn(appointment.start)}</TableCell>
                                                <TableCell>{appointment.lessons.map((l: Lesson) => l.duration)
                                                    .reduce((acc: number, curr: number) => acc + curr, 0)}</TableCell>
                                                <TableCell>{appointment.doubleBooking ?
                                                    <Info color="error"/> : appointment.environment ||
                                                    <PendingOutlined/>}</TableCell>
                                                <TableCell>
                                                    {appointment.lessons.map((lesson: Lesson) => {
                                                        return (
                                                            <Chip
                                                                key={`${appointment.id}-${lesson.id}`}
                                                                label={lesson.identifier}
                                                                size="small"
                                                                color="info"
                                                                style={{margin: '2px'}}
                                                            />
                                                        )
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>}
                    </CardContent>
                </Card>
            </Grid2>
            <Grid2 size={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Recent Training Activity</Typography>
                        {recentLogs.length === 0 && <Typography sx={{mt: 1,}}>No recent training activity</Typography>}
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