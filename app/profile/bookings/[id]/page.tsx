'use client';
import React, {use} from 'react';
import {notFound} from "next/navigation";
import {Card, CardContent, Skeleton, Typography} from "@mui/material";
import AtcBookingForm from "@/components/AtcBooking/AtcBookingForm";
import RequireAuth from "@/components/Access/RequireAuth";
import {useMe} from "@/lib/osmium/hooks/me";
import {useAtcBooking} from "@/lib/osmium/hooks/bookings";

function EditBookingView({id}: { id: number }) {
    const {data: me} = useMe();
    const {data: booking, isLoading, error} = useAtcBooking(id);

    if (!me || isLoading) {
        return <Card><CardContent><Skeleton height={200}/></CardContent></Card>;
    }

    if (error || !booking) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Edit ATC Booking</Typography>
                <AtcBookingForm cid={me.cid} timezone={me.profile.timezone} booking={booking}/>
            </CardContent>
        </Card>
    );
}

export default function Page({params}: { params: Promise<{ id: string }> }) {
    const {id} = use(params);
    return (
        <RequireAuth>
            <EditBookingView id={Number(id)}/>
        </RequireAuth>
    );
}
