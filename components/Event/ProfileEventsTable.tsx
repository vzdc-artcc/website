'use client';
import React from 'react';
import {
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {formatTimezoneDate} from "@/lib/date";
import {useUserEventPositions} from "@/lib/osmium/hooks/events";
import {useMe} from "@/lib/osmium/hooks/me";

export default function ProfileEventsTable() {

    const {data: me} = useMe();
    const timezone = me?.profile.timezone ?? 'America/New_York';
    const {data} = useUserEventPositions(me?.cid ?? NaN);
    const events = data?.items ?? [];

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Your Previous Events</Typography>
                {events.length === 0 && <Typography>You have no previously published event positions.</Typography>}
                {events.length > 0 && <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Event</TableCell>
                                <TableCell>Position Time</TableCell>
                                <TableCell>Final Position</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {events.map((position) => (
                                <TableRow key={position.id}>
                                    <TableCell>{position.event_title}</TableCell>
                                    <TableCell>{formatTimezoneDate(new Date(position.final_start_time || position.event_starts_at), timezone)} - {formatTimezoneDate(new Date(position.final_end_time || position.event_starts_at), timezone)}</TableCell>
                                    <TableCell>{position.final_position}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>}
            </CardContent>
        </Card>
    );
}
