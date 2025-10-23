import React from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Stack, Typography} from "@mui/material";
import {ExpandMore, Info} from "@mui/icons-material";

export default async function Layout({children}: { children: React.ReactNode }) {
    return (
        <Stack direction="column" spacing={2}>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Info color="info"/>
                        <Typography><b>ATC Booking Policy</b> <span style={{color: "red"}}>(READ BEFORE BOOKING)</span></Typography>
                    </Stack>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction="column" spacing={2}>
                        <Typography>
                            Controllers may hold a maximum of <b>two active bookings</b> with vZDC at any given time.
                        </Typography>
                        <Typography>
                            Bookings must be made at least <b>two hours in advance</b>, but no more than <b>72 hours in
                            advance</b>.
                        </Typography>
                        <Typography>
                            Each booking may be made for a maximum duration of <b>two hours</b>.
                        </Typography>
                        <Typography>
                            Bookings <b>do not guarantee that you will be one staffing</b> the requested position.
                            VATSIM and VATUSA policies state that all positions are staffed on a first-come,
                            first-served
                            basis regardless of booking status.
                        </Typography>
                        <Typography>
                            <b>ATC bookings are separate from event signups.</b> Bookings are intended for non-event
                            staffing only. To participate in an event, please complete the signup form provided on that
                            event’s page. <b>Any event takes priority over ATC bookings.</b>
                        </Typography>
                        <Typography>
                            <b>Controllers are required to staff their booked positions as scheduled.</b> You do not
                            necessarily need to be one staffing the requested position, but it must be staffed during
                            the entire duration of the booking by at least one controller. Repeated
                            no-shows may result in disciplinary action.
                        </Typography>
                    </Stack>
                </AccordionDetails>
            </Accordion>
            {children}
        </Stack>
    );
}