'use client';
import React from 'react';
import Image from 'next/image';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Card,
    CardContent,
    Link,
    Stack,
    Typography
} from "@mui/material";
import EventCalendar from '@/components/Events/EventCalendar';
import {formatZuluDate} from '@/lib/date';
import Placeholder from '@/public/img/logo_large.png';
import {ExpandMore} from '@mui/icons-material';
import {useEvents} from "@/lib/osmium/hooks/events";
import {cdnImagesUnoptimized, osmiumBaseUrl} from "@/lib/osmium/client";
import {useMe} from "@/lib/osmium/hooks/me";

export default function EventListView() {

    const {data: me} = useMe();
    const timezone = me?.profile.timezone ?? 'America/New_York';
    const {data} = useEvents({pageSize: 200});
    const events = (data?.items ?? []).filter((e) => !e.hidden);

    return (
        <>
            <Accordion sx={{mb: 2,}}>
                <AccordionSummary expandIcon={<ExpandMore/>}>
                    <Typography variant="h6">Upcoming Events - Legend</Typography>
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
                    <EventCalendar events={events} timeZone={timezone}/>
                </CardContent>
            </Card>
            {events.length > 0 && <Typography variant="h6" sx={{my: 2,}}>List View</Typography>}
            <Stack direction="column" spacing={2}>
                {events.slice(0, 10).map((event) => (
                    <Card key={event.id}>
                        <CardContent>
                            <Link href={`/events/${event.id}`} style={{color: 'inherit', textDecoration: 'none',}}>
                                <Box sx={{position: 'relative', width: '100%', minHeight: 200,}}>
                                    <Image
                                        unoptimized={cdnImagesUnoptimized}
                                        src={event.banner_asset_id ? `${osmiumBaseUrl}/cdn/${event.banner_asset_id}` : Placeholder}
                                        alt={event.title} fill style={{objectFit: 'contain'}}/>
                                </Box>
                            </Link>
                            <Typography variant="h5">{event.title}</Typography>
                            <Typography variant="subtitle2">
                                {formatZuluDate(new Date(event.starts_at))} - {formatZuluDate(new Date(event.ends_at)).substring(9)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </>
    );
}
