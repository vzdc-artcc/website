'use client';
import React from 'react';
import {
    Card,
    CardContent,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import {Info, PendingOutlined} from "@mui/icons-material";
import {getTimeIn} from "@/lib/date";
import {useTrainingAppointments} from "@/lib/osmium/hooks/training";

export default function UpcomingAppointmentsCard() {
    const {data} = useTrainingAppointments({pageSize: 200});
    const now = new Date();
    const upcomingAppointments = (data?.items ?? [])
        .filter((appointment) => new Date(appointment.start) >= now)
        .slice(0, 5);

    return (
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
                                            <Chip label={appointment.trainer_name || 'Unknown'} size="small"/>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={appointment.student_name || 'Unknown'} size="small"/>
                                        </TableCell>
                                        <TableCell>{getTimeIn(new Date(appointment.start))}</TableCell>
                                        <TableCell>{appointment.estimated_duration_minutes ?? 0}</TableCell>
                                        <TableCell>{appointment.double_booking ?
                                            <Tooltip title="Double Booking.  Check calendar for specifics.">
                                                <Info color="error"/>
                                            </Tooltip>
                                            : appointment.environment ||
                                            <PendingOutlined color="warning"/>}</TableCell>
                                        <TableCell>
                                            {appointment.lessons.map((lesson) => (
                                                <Chip
                                                    key={`${appointment.id}-${lesson.id}`}
                                                    label={lesson.identifier}
                                                    size="small"
                                                    color="info"
                                                    style={{margin: '2px'}}
                                                />
                                            ))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
            </CardContent>
        </Card>
    );
}
