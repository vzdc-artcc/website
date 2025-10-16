import React from 'react';
import {Alert, Card, CardContent, Stack, Typography} from "@mui/material";

export default async function Layout({children}: { children: React.ReactNode }) {
    return (
        <Stack direction="column" spacing={2}>
            <Alert severity="info">
                <b>ATC Booking Disclaimer</b>
                <ul>
                    <li>You are only allowed to have <b>two</b> bookings from vZDC at a time.</li>
                    <li>We do not manage ATC bookings; your data is sent to a VATSIM ATC Bookings which relays it to other services on behalf of vZDC, like Vatsim Radar.  Because of this, vZDC has no control over what happens to the data that you provide except for the actions available to you on this website.  <b>Please do not ask for support regarding ATC bookings as we have no control over them except for what is provided to you.</b></li>
                    <li>Booking a position <b>is not the same as signing up for an event</b>.  ATC bookings are intended for non-event staffing.  To sign up for an event, fill out the form on the appropriate event page.</li>
                    <li style={{ color: 'red'}}><b>INSERT/MODIFY -- SSTF THOUGHTS HERE</b></li>
                </ul>
            </Alert>
            {children}
        </Stack>
    );
}