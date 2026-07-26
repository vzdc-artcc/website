'use client'
import React, {useState} from 'react';
import {Box, IconButton, Typography} from "@mui/material";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import Image from "next/image";
import {formatZuluDate} from "@/lib/date";
import Link from "next/link";
import Placeholder from "@/public/img/logo_large.png"
import {useEvents} from "@/lib/osmium/hooks/events";
import {cdnImagesUnoptimized, osmiumBaseUrl} from "@/lib/osmium/client";

export default function UpcomingEventsCarousel() {
    const {data} = useEvents({pageSize: 200});
    const events = (data?.items ?? [])
        .filter((event) => !event.hidden && new Date(event.starts_at) > new Date())
        .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
        .slice(0, 5);

    const [index, setIndex] = useState(0);
    const count = events.length;
    // Keep the active index in range if the event list shrinks after a refetch.
    const active = count > 0 ? Math.min(index, count - 1) : 0;

    if (count === 0) {
        return null;
    }

    const go = (delta: number) => setIndex((active + delta + count) % count);
    const event = events[active];

    return (
        <Box sx={{position: 'relative',}}>
            <Link href={`/events/${event.id}`} style={{textDecoration: 'none', color: 'inherit',}}>
                <Box sx={{width: '100%', px: 4,}}>
                    <Box sx={{position: 'relative', width: '100%', height: 400,}}>
                        <Image priority
                               unoptimized={cdnImagesUnoptimized}
                               src={event.banner_asset_id ? `${osmiumBaseUrl}/cdn/${event.banner_asset_id}` : Placeholder}
                               alt={event.title} fill
                               style={{objectFit: 'contain', position: 'absolute',}}/>
                    </Box>
                    <Typography variant="h6" sx={{mt: 1,}}>{event.title}</Typography>
                    <Typography variant="subtitle2">{formatZuluDate(new Date(event.starts_at))}</Typography>
                </Box>
            </Link>

            {count > 1 && (
                <>
                    <IconButton
                        aria-label="Previous event"
                        onClick={() => go(-1)}
                        sx={{position: 'absolute', top: 180, left: 0,}}
                    >
                        <ChevronLeft/>
                    </IconButton>
                    <IconButton
                        aria-label="Next event"
                        onClick={() => go(1)}
                        sx={{position: 'absolute', top: 180, right: 0,}}
                    >
                        <ChevronRight/>
                    </IconButton>
                    <Box sx={{display: 'flex', justifyContent: 'center', gap: 1, mt: 1,}}>
                        {events.map((e, i) => (
                            <Box
                                key={e.id}
                                onClick={() => setIndex(i)}
                                sx={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    bgcolor: i === active ? 'primary.main' : 'action.disabled',
                                }}
                            />
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
}
