'use client'
import React from 'react';
import {Event} from "@/generated/prisma/browser";
import Carousel from "react-material-ui-carousel";
import {Box, Typography} from "@mui/material";
import Image from "next/image";
import {formatZuluDate} from "@/lib/date";
import Link from "next/link";
import Placeholder from "@/public/img/logo_large.png"

export default function UpcomingEventsCarousel({events, imageUrls}: {
    events: Event[],
    imageUrls: { // noinspection JSUnusedLocalSymbols
        [key: string]: string
    },
}) {
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
                            <Image priority src={imageUrls[event.id] || Placeholder} alt={event.name} fill
                                   style={{objectFit: 'contain', position: 'absolute',}}/>
                        </Box>
                        <Typography variant="h6" sx={{mt: 1,}}>{event.name}</Typography>
                        <Typography variant="subtitle2">{formatZuluDate(event.start)}</Typography>
                    </Box>
                </Link>
            ))}
        </Carousel>
    );
}