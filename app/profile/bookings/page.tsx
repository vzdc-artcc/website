import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {fetchAtcBookings} from "@/actions/atc_booking";
import AtcBookingTable from "@/components/AtcBooking/AtcBookingTable";
import {Add} from "@mui/icons-material";
import Link from "next/link";

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return (<></>);
    }

    const bookings = await fetchAtcBookings(session.user.cid);

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" gutterBottom>Your ATC Bookings</Typography>
                    { bookings.length <= 2 && <Link href="/profile/bookings/new" style={{textDecoration: 'none', color: 'inherit',}}>
                        <Button variant="contained" size="large" startIcon={<Add />}>New ATC Booking</Button>
                    </Link> }
                </Stack>

                {typeof bookings === 'string' ? <Typography color="error">{bookings}</Typography> :
                <AtcBookingTable bookings={bookings} timeZone={session.user.timezone} /> }
            </CardContent>
        </Card>
    );
}