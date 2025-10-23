import React from 'react';
import {fetchAtcBooking} from "@/actions/atcBooking";
import {notFound} from "next/navigation";
import {Card, CardContent, Typography} from "@mui/material";
import AtcBookingForm from "@/components/AtcBooking/AtcBookingForm";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) return;

    const booking = await fetchAtcBooking(Number(id));

    if (typeof booking === 'string' || !booking) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Edit ATC Booking</Typography>
                <AtcBookingForm user={session.user} booking={booking} />
            </CardContent>
        </Card>
    );
}