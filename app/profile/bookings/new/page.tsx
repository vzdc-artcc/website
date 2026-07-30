'use client';
import React from 'react';
import {Card, CardContent, Skeleton, Typography} from "@mui/material";
import AtcBookingForm from "@/components/AtcBooking/AtcBookingForm";
import ErrorCard from "@/components/Error/ErrorCard";
import RequireAuth from "@/components/Access/RequireAuth";
import {useMe} from "@/lib/osmium/hooks/me";
import {useAtcBookings} from "@/lib/osmium/hooks/bookings";

function NewBookingView() {
    const {data: me} = useMe();
    const {data, isLoading} = useAtcBookings(me?.cid);

    if (!me || isLoading) {
        return <Card><CardContent><Skeleton height={200}/></CardContent></Card>;
    }

    const bookings = data?.items ?? [];
    if (bookings.length > 2) {
        return <ErrorCard heading="Too Many Bookings"
                          message="You can have a maximum of 2 bookings at any given time."/>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New ATC Booking</Typography>
                <AtcBookingForm cid={me.cid} timezone={me.profile.timezone}/>
            </CardContent>
        </Card>
    );
}

export default function Page() {
    return (
        <RequireAuth>
            <NewBookingView/>
        </RequireAuth>
    );
}
