import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import AtcBookingForm from "@/components/AtcBooking/AtcBookingForm";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import ErrorCard from "@/components/Error/ErrorCard";
import {fetchAtcBookings} from "@/actions/atc_booking";

export default async function Page() {

    const session = await getServerSession(authOptions);
    if (!session?.user) return;

    const bookings = await fetchAtcBookings(session.user.cid);
    if (typeof bookings === 'string' || bookings.length > 2) {
        return <ErrorCard heading="Too Many Bookings"
                          message="You can have a maximum of 2 bookings at any given time."/>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New ATC Booking</Typography>
                <AtcBookingForm user={session.user} />
            </CardContent>
        </Card>
    );
}