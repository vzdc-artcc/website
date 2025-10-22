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
                        Each booking may be made for a maximum duration of <b>two hours</b>.
                    </Typography>
                    <Typography variant="caption">
                        Bookings <b>do not guarantee that you will be one staffing</b> the requested position. The
                        VATSIM and VATUSA policies state that all positions are staffed on a first-come, first-served
                        basis.
                    </Typography>
                    <Typography variant="caption">
                        Bookings may be made up to <b>72 hours in advance</b>.
                    </Typography>
                    <Typography variant="caption">
                        <b>ATC bookings are separate from event signups.</b> Bookings are intended for non-event
                        staffing only. To participate in an event, please complete the signup form provided on that
                        event’s page. <b>Any event takes priority over booking.</b>
                    </Typography>
                    <Typography variant="caption">
                        Controllers are strongly encouraged to staff their booked positions as scheduled. Repeated
                        no-shows may result in disciplinary actions.
                    </Typography>
                    <Typography variant="subtitle1">
                        Read all administrative policies before booking a position to ensure that you understand all the
                        rules.
                    </Typography>
                </Stack>
            </Alert>
            {children}
        </Stack>
    );
}