'use client';
import React from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import Image from "next/image";
import Markdown from "react-markdown";
import Placeholder from "@/public/img/logo_large.png";
import {formatTimezoneDate, formatZuluDate} from '@/lib/date';
import EventPositionRequestForm from '@/components/EventPosition/EventPositionRequestForm';
import {useEvent, useEventOpsPlan, useEventPositions} from "@/lib/osmium/hooks/events";
import {useMe} from "@/lib/osmium/hooks/me";
import {osmiumBaseUrl} from "@/lib/osmium/client";

export default function EventDetailView({eventId}: {
    eventId: string,
}) {

    const {data: event, isLoading, isError} = useEvent(eventId);
    const {data: opsPlan} = useEventOpsPlan(eventId);
    const {data: positionsData} = useEventPositions(eventId, {pageSize: 200});
    const {data: me} = useMe();
    // Identity/eligibility from osmium (Phase 6). Event-signup eligibility is
    // ultimately enforced by osmium's request endpoint; the frontend just
    // hides the form for logged-out users and those who opted out.
    const loggedIn = !!me;
    const canSignUp = !!me && !me.flags.no_event_signup;
    const timezone = me?.profile.timezone ?? 'America/New_York';

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (isError || !event || event.hidden) {
        return <Typography textAlign="center" variant="h5">Event not found.</Typography>;
    }

    const positions = positionsData?.items ?? [];
    const myPosition = me ? positions.find((p) => p.user_id === me.id) : undefined;
    const otherPublishedPositions = positions
        .filter((p) => p.published && p.user_id !== me?.id)
        .sort((a, b) => (a.user_name || '').localeCompare(b.user_name || ''));
    const allPublishedPositions = [...otherPublishedPositions, ...(myPosition?.published ? [myPosition] : [])];

    return (
        <Container maxWidth="md">
            <Stack direction="column" spacing={2}>
                <Card>
                    <CardContent>
                        <Grid container columns={2} spacing={2}>
                            <Grid size={2}>
                                <Box sx={{position: 'relative', width: '100%', minHeight: 400,}}>
                                    <Image
                                        src={event.banner_asset_id ? `${osmiumBaseUrl}/cdn/${event.banner_asset_id}` : Placeholder}
                                        alt={event.title} priority fill style={{objectFit: 'contain'}}/>
                                </Box>
                            </Grid>
                            <Grid size={2}>
                                <Stack direction="column" spacing={1} sx={{mb: 4,}}>
                                    <Typography variant="h5">{event.title}</Typography>
                                    {loggedIn && <Typography variant="subtitle1">
                                        {formatTimezoneDate(new Date(event.starts_at), timezone)}
                                        - {formatTimezoneDate(new Date(event.ends_at), timezone)}
                                    </Typography>}
                                    {!loggedIn && <Typography variant="subtitle1">
                                        {formatZuluDate(new Date(event.starts_at))}
                                        - {formatZuluDate(new Date(event.ends_at))}
                                    </Typography>}
                                </Stack>
                                <Markdown>{event.description || ''}</Markdown>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
                {canSignUp && !myPosition?.published && <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Request Position</Typography>
                        {opsPlan?.enable_buffer_times && <Alert severity="info" sx={{mb: 2,}}>
                            This event has buffer times enabled. You may request to sign up for an extended period
                            of <b>two hours before</b> and <b>two hours after the event</b>. By default, your requested
                            time will be the duration of the event, <b>NOT including the buffer times</b>.
                        </Alert>}
                        <EventPositionRequestForm
                            event={{
                                id: event.id,
                                preset_positions: opsPlan?.preset_positions ?? [],
                                enable_buffer_times: opsPlan?.enable_buffer_times ?? false,
                                starts_at: event.starts_at,
                                ends_at: event.ends_at,
                                positions_locked: event.positions_locked,
                            }}
                            eventPosition={myPosition}
                            currentUserTimezone={timezone}
                        />
                    </CardContent>
                </Card>}
                {canSignUp && myPosition?.published && <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Your Position Assignment</Typography>
                        <Typography variant="h5" textAlign="center">{myPosition.final_position}</Typography>
                        <Typography variant="subtitle2" textAlign="center" gutterBottom>
                            {formatTimezoneDate(new Date(myPosition.final_start_time || event.starts_at), timezone)} - {formatTimezoneDate(new Date(myPosition.final_end_time || event.ends_at), timezone)}
                        </Typography>
                        <Typography textAlign="center" sx={{mb: 4}}>{myPosition.final_notes}</Typography>
                        <Typography variant="caption">Contact the events team if you have any questions.</Typography>
                    </CardContent>
                </Card>}
                {loggedIn && <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Published Positions</Typography>
                        {allPublishedPositions.length === 0 && <Typography>No positions have been published.</Typography>}
                        {allPublishedPositions.length > 0 && <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Controller</TableCell>
                                        <TableCell>Position</TableCell>
                                        <TableCell>Start</TableCell>
                                        <TableCell>End</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {allPublishedPositions.map((position) => (
                                        <TableRow key={position.id}>
                                            <TableCell>{position.user_name}{position.user_cid ? ` (${position.user_cid})` : ''}</TableCell>
                                            <TableCell>{position.final_position}</TableCell>
                                            <TableCell>{position.final_start_time === event.starts_at ? 'EVENT' : formatTimezoneDate(new Date(position.final_start_time || event.starts_at), timezone)}</TableCell>
                                            <TableCell>{position.final_end_time === event.ends_at ? 'EVENT' : formatTimezoneDate(new Date(position.final_end_time || event.ends_at), timezone)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>}
                    </CardContent>
                </Card>}
            </Stack>
        </Container>
    );
}
