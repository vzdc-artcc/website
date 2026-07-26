'use client';
import React from 'react';
import Link from 'next/link';
import {formatZuluDate} from '@/lib/date';
import Placeholder from '@/public/img/logo_large.png';
import {Box, Card, CardContent, CircularProgress, Container, Paper, Stack, Typography,} from '@mui/material';
import Image from "next/image";
import {useQueries} from "@tanstack/react-query";
import {useEvents} from "@/lib/osmium/hooks/events";
import {osmium, osmiumBaseUrl} from "@/lib/osmium/client";

export default function Page() {
    const {data, isLoading} = useEvents({pageSize: 200});
    const events = (data?.items ?? []).filter((e) => !e.hidden);

    const opsPlanQueries = useQueries({
        queries: events.map((event) => ({
            queryKey: ["osmium", "events", "ops-plan", event.id],
            queryFn: async () => {
                const {data, error} = await osmium.GET("/api/v1/events/{event_id}/ops-plan", {
                    params: {path: {event_id: event.id}},
                });
                if (error) throw error;
                return data;
            },
        })),
    });

    const publishedEvents = events.filter((_, i) => opsPlanQueries[i]?.data?.ops_plan_published);

    return (
        <Container maxWidth="lg" sx={{py: 3}}>
            <Typography variant="h4" sx={{mb: 2}}>
                Published OPS Plans
            </Typography>
            {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>}
            {!isLoading && publishedEvents.length === 0 ? (
                <Paper elevation={2} sx={{p: 4}}>
                    <Stack spacing={1}>
                        <Typography variant="h6">No published OPS plans</Typography>
                        <Typography color="text.secondary">
                            There are currently no published operations plans. When an event planner publishes an ops plan it will appear here for controllers to view.
                        </Typography>
                    </Stack>
                </Paper>
            ) : (
                <Stack direction="column" spacing={2}>
                    {publishedEvents.slice(0, 10).map((event) => (
                        <Card key={event.id}>
                            <CardContent>
                                <Link href={`/events/${event.id}/ops`} style={{color: 'inherit', textDecoration: 'none',}}>
                                    <Box sx={{position: 'relative', width: '100%', minHeight: 200,}}>
                                        <Image
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
            )}
        </Container>
    );
}
