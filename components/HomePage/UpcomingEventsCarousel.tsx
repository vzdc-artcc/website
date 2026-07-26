'use client'
import React from 'react';
import Carousel from "react-material-ui-carousel";
import {Box, Typography} from "@mui/material";
import Image from "next/image";
import {formatZuluDate} from "@/lib/date";
import Link from "next/link";
import Placeholder from "@/public/img/logo_large.png"
import {useEvents} from "@/lib/osmium/hooks/events";
import {osmiumBaseUrl} from "@/lib/osmium/client";

export default function UpcomingEventsCarousel() {
    const {data} = useEvents({pageSize: 200});
    const events = (data?.items ?? [])
        .filter((event) => !event.hidden && new Date(event.starts_at) > new Date())
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
        .slice(0, 5);

    return (
        <Carousel
            autoPlay={false}
            animation="slide"
            fullHeightHover
            navButtonsAlwaysVisible={false}
        >
            {events.map(event => (
                <Link key={event.id} href={`/events/${event.id}`} style={{textDecoration: 'none', color: 'inherit',}}>
                    <Box sx={{width: '100%', px: 4,}}>
                        <Box sx={{position: 'relative', width: '100%', height: 400,}}>
                            <Image priority
                                   src={event.banner_asset_id ? `${osmiumBaseUrl}/cdn/${event.banner_asset_id}` : Placeholder}
                                   alt={event.title} fill
                                   style={{objectFit: 'contain', position: 'absolute',}}/>
                        </Box>
                        <Typography variant="h6" sx={{mt: 1,}}>{event.title}</Typography>
                        <Typography variant="subtitle2">{formatZuluDate(new Date(event.starts_at))}</Typography>
                    </Box>
                </Link>
            ))}
        </Carousel>
    );
}
