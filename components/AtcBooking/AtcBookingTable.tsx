import React from 'react';
import {IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {AtcBooking} from "@/lib/atcBooking";
import AtcBookingDeleteButton from "@/components/AtcBooking/AtcBookingDeleteButton";
import Link from "next/link";
import {Edit} from "@mui/icons-material";
import {formatTimezoneDate} from "@/lib/date";

export default function AtcBookingTable({ bookings, timeZone }: { bookings: AtcBooking[], timeZone: string }) {

    if (!bookings || bookings.length === 0) {
        return <Typography>No ATC Bookings found.</Typography>;
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Callsign</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                        <TableCell>{booking.callsign}</TableCell>
                        <TableCell>{formatTimezoneDate(booking.start, timeZone)}</TableCell>
                        <TableCell>{formatTimezoneDate(booking.end, timeZone)}</TableCell>
                        <TableCell>
                            <Link href={`/profile/bookings/${booking.id}`} style={{ textDecoration: 'none', color: 'inherit', }}>
                                <IconButton>
                                    <Edit />
                                </IconButton>
                            </Link>
                            <AtcBookingDeleteButton bookingId={booking.id} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}