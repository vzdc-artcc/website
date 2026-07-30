'use client';
import React from 'react';
import {Button, Card, CardContent, Skeleton, Stack, Typography} from "@mui/material";
import AtcBookingTable from "@/components/AtcBooking/AtcBookingTable";
import {Add} from "@mui/icons-material";
import Link from "next/link";
import RequireAuth from "@/components/Access/RequireAuth";
import {useMe} from "@/lib/osmium/hooks/me";
import {useAtcBookings} from "@/lib/osmium/hooks/bookings";

function BookingsView() {
    const {data: me} = useMe();
    const {data, isLoading, error} = useAtcBookings(me?.cid);
    const bookings = data?.items ?? [];

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <Typography variant="h5" gutterBottom>Your ATC Bookings</Typography>
                    {bookings.length <= 2 &&
                        <Link href="/profile/bookings/new" style={{textDecoration: 'none', color: 'inherit',}}>
                            <Button variant="contained" size="large" startIcon={<Add/>}>New ATC Booking</Button>
                        </Link>}
                </Stack>

                {isLoading ? <Skeleton height={80}/> :
                    error ? <Typography color="error">{(error as Error).message}</Typography> :
                        <AtcBookingTable bookings={bookings} timeZone={me?.profile.timezone || 'America/New_York'}/>}
            </CardContent>
        </Card>
    );
}

export default function Page() {
    return (
        <RequireAuth>
            <BookingsView/>
        </RequireAuth>
    );
}
