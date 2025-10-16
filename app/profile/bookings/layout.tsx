import React from 'react';
import {Alert, Stack, Typography} from "@mui/material";

export default async function Layout({children}: { children: React.ReactNode }) {
    return (
        <Stack direction="column" spacing={2}>
            <Alert severity="info">
                <Typography variant="h6" gutterBottom>ATC Booking Policy</Typography>
                <Stack direction="column" spacing={1}>
                    <Typography variant="caption">
                        Controllers may hold a maximum of <b>two active bookings</b> with vZDC at any given time.
                    </Typography>
                    <Typography variant="caption">
                        <b>vZDC does not directly manage ATC bookings.</b> Your booking data is submitted to the VATSIM
                        ATC Bookings system, which relays it to third-party services such as VATSIM Radar. As a result,
                        vZDC has no control over how your data is handled beyond the actions available through this
                        website. Please do not contact vZDC staff for support regarding ATC bookings, as we cannot
                        modify or intervene in those systems.
                    </Typography>
                    <Typography variant="caption">
                        <b>ATC bookings are separate from event signups.</b> Bookings are intended for non-event
                        staffing only. To participate in an event, please complete the signup form provided on that
                        event’s page.
                    </Typography>
                    <Typography variant="caption">
                        Controllers are strongly encouraged to staff their booked positions as scheduled. However, due
                        to the informal nature of the ATC booking system, there are minimal consequences for missed
                        bookings. Event signups, however, are still strictly enforced.
                    </Typography>
                    <Typography variant="caption" sx={{color: 'red'}}>
                        <b>INSERT/MODIFY -- SSTF THOUGHTS HERE</b>
                    </Typography>
                </Stack>
            </Alert>
            {children}
        </Stack>
    );
}