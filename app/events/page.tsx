import React from 'react';
import Image from 'next/image';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Container,
    Link,
    Stack,
    Typography
} from "@mui/material";
import {Metadata} from "next";
import EventCalendar from '@/components/Events/EventCalendar';
import prisma from '@/lib/db';
import {formatZuluDate} from '@/lib/date';
import Placeholder from '@/public/img/logo_large.png';
import {ExpandMore} from '@mui/icons-material';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export const metadata: Metadata = {
    title: 'Events | vZDC',
    description: 'vZDC events page',
};

export default async function Page() {

    const events = await prisma.event.findMany({
        where: {
            hidden: false,
        },
        orderBy: {
            start: 'asc',
        },
    });

    const session = await getServerSession(authOptions);

    return (
        <Container maxWidth="lg">
            <Accordion sx={{ mb: 2, }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Legend</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction="column" spacing={2} sx={{mt: 1,}}>
                        <Typography color="#f44336" fontWeight="bold" sx={{p: 1, border: 1,}}>Home</Typography>
                        <Typography color="#cd8dd8" fontWeight="bold"
                                    sx={{p: 1, border: 1,}}>Support/Optional</Typography>
                        <Typography color="#834091" fontWeight="bold"
                                    sx={{p: 1, border: 1,}}>Support/Required</Typography>
                            <Typography color="#36d1e7" fontWeight="bold"
                            sx={{p: 1, border: 1,}}>Friday Night Operations</Typography>
                            <Typography color="#e6af34" fontWeight="bold"
                            sx={{p: 1, border: 1,}}>Saturday Night Operations</Typography>
                        <Typography color="#66bb6a" fontWeight="bold" sx={{p: 1, border: 1,}}>Group Flight</Typography>
                        <Typography color="darkgray" fontWeight="bold" sx={{p: 1, border: 1,}}>Training</Typography>
                    </Stack>
                </AccordionDetails>
            </Accordion>
            <Card>
                <CardContent>
                    <EventCalendar events={events} timeZone={session?.user.timezone || 'America/New_York'}/>
                </CardContent>
            </Card>
            {events.length > 0 && <Typography variant="h6" sx={{my: 2,}}>List View</Typography>}
            <Stack direction="column" spacing={2}>
                {events.slice(0, 10).map(async (event) => (
                    <Card key={event.id}>
                        <CardContent>
                            <Link href={`/events/${event.id}`} style={{color: 'inherit', textDecoration: 'none',}}>
                                <Box sx={{position: 'relative', width: '100%', minHeight: 200,}}>
                                    <Image src={event.bannerKey ? `https://utfs.io/f/${event.bannerKey}` : Placeholder}
                                           alt={event.name} fill style={{objectFit: 'contain'}}/>
                                </Box>
                            </Link>
                            <Typography variant="h5">{event.name}</Typography>
                            <Typography
                                variant="subtitle2">{formatZuluDate(event.start)} - {formatZuluDate(event.end).substring(9)}</Typography>
                            <Typography variant="subtitle2">{event.featuredFields.join(', ')}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Container>

    );

}