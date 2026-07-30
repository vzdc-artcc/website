'use client';
import React from 'react';
import AtcBookingsCalendar from "@/components/AtcBooking/AtcBookingsCalendar";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Card,
    CardContent,
    Container,
    Stack,
    Typography
} from "@mui/material";
import {ExpandMore} from "@mui/icons-material";
import RequireAuth from "@/components/Access/RequireAuth";
import {useMe} from "@/lib/osmium/hooks/me";
import {useAtcBookings} from "@/lib/osmium/hooks/bookings";

function CalendarView() {
    const {data: me} = useMe();
    const {data} = useAtcBookings();
    const bookings = data?.items ?? [];

    return (
        <Container maxWidth="lg">
            <Accordion sx={{mb: 2,}}>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">ATC Bookings - Legend</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction="column" spacing={2} sx={{mt: 1,}}>
                        <Typography color="cyan" fontWeight="bold" sx={{p: 1, border: 1,}}>Booking</Typography>
                        <Typography color="red" fontWeight="bold" sx={{p: 1, border: 1,}}>Training</Typography>
                    </Stack>
                </AccordionDetails>
            </Accordion>
            <Card>
                <CardContent>
                    <AtcBookingsCalendar bookings={bookings}
                                         timeZone={me?.profile.timezone || 'America/New_York'}/>
                </CardContent>
            </Card>
        </Container>
    );
}

export default function Page() {
    return (
        <RequireAuth>
            <CalendarView/>
        </RequireAuth>
    );
}
