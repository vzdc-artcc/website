import React from 'react';
import AtcBookingsCalendar from "@/components/AtcBooking/AtcBookingsCalendar";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {fetchAtcBookings} from "@/actions/atcBooking";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const atcBookings = await fetchAtcBookings();

    return Array.isArray(atcBookings) && (
        <AtcBookingsCalendar bookings={atcBookings} timeZone={session?.user.timezone || 'America/New_York'}/>
    );
}