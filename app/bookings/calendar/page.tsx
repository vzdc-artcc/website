import React from 'react';
import AtcBookingsCalendar from "@/components/AtcBooking/AtcBookingsCalendar";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {fetchAtcBookings} from "@/actions/atcBooking";
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

export default async function Page() {

    const session = await getServerSession(authOptions);

    const atcBookings = await fetchAtcBookings();

    return (
        <Container maxWidth="lg">
            <Accordion sx={{mb: 2,}}>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">ATC Bookings - Legend</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction="column" spacing={2} sx={{mt: 1,}}>
                        <Typography color="cyan" fontWeight="bold" sx={{p: 1, border: 1,}}>Booking</Typography>
                        <Typography color="red" fontWeight="bold"
                                    sx={{p: 1, border: 1,}}>Training</Typography>
                    </Stack>
                </AccordionDetails>
            </Accordion>
            <Card>
                <CardContent>
                    <AtcBookingsCalendar bookings={Array.isArray(atcBookings) ? atcBookings : []}
                                         timeZone={session?.user.timezone || 'America/New_York'}/>
                </CardContent>
            </Card>
        </Container>
    )
}