'use client';
import React from 'react';
import {Card, CardContent, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import {OpenInNew} from "@mui/icons-material";
import {formatZuluDate, getDuration, getTimeIn} from "@/lib/date";
import {useAtcBookings} from "@/lib/osmium/hooks/bookings";
import {useRosterControllers} from "@/lib/osmium/hooks/users";
import {useTrainingAppointments} from "@/lib/osmium/hooks/training";

const toDate = (s: string) => new Date(s.replace(" ", "T") + "Z");

export default function UpcomingAtcCard() {
    const {data: bookingsData} = useAtcBookings();
    const {data: rosterData} = useRosterControllers();
    const {data: appointmentsData} = useTrainingAppointments();

    const bookings = bookingsData?.items ?? [];
    const roster = rosterData?.items ?? [];
    const appointments = appointmentsData?.items ?? [];

    const upcoming = bookings
        .filter((b) => toDate(b.start) > new Date())
        .slice(0, 10);

    return (
        <Card sx={{height: '50%', overflowY: 'auto',}}>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Upcoming ATC
                    <Link href="/bookings/calendar" style={{color: 'inherit', textDecoration: 'none',}}>
                        <OpenInNew fontSize="small" sx={{ml: 1,}}/>
                    </Link>
                </Typography>
                <Stack direction="column" spacing={1}>
                    {upcoming.length > 0 ? upcoming.map((booking) => {
                        const booker = roster.find((u) => u.basic.cid === booking.cid);
                        const appointment = booking.type === 'training'
                            ? appointments.find((a) => a.atc_booking_id === String(booking.id))
                            : undefined;
                        return (
                            <Card elevation={0} key={booking.id}>
                                <CardContent>
                                    <Stack direction="row" spacing={1} justifyContent="space-between">
                                        <Typography fontWeight="bold">{booking.callsign}</Typography>
                                        <Tooltip arrow
                                                 title={`${formatZuluDate(toDate(booking.start))} | Duration: ${getDuration(toDate(booking.start), toDate(booking.end))}`}>
                                            <Typography>{getTimeIn(toDate(booking.start))}</Typography>
                                        </Tooltip>
                                    </Stack>
                                    <Typography>
                                        {booker?.basic.name} {booker?.basic.rating ? `(${booker.basic.rating})` : ''}
                                    </Typography>
                                    {booking.type === 'training' && appointment && (
                                        <Typography variant="caption">
                                            Student: {appointment.student_name}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    }) : <Typography>No upcoming ATC bookings</Typography>}
                </Stack>
            </CardContent>
        </Card>
    );
}
