import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Box, Card, CardContent, Container, Grid2, Stack, Typography} from "@mui/material";
import Image from "next/image";
import Markdown from "react-markdown";
import Placeholder from "@/public/img/logo_large.png";
import {formatZuluDate} from '@/lib/date';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/auth/auth';
import EventPositionRequestForm from '@/components/EventPosition/EventPositionRequestForm';
import {User} from '@prisma/client';
import LoginButton from "@/components/Navbar/LoginButton";

export default async function Page(props: { params: Promise<{ id: string }> }) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return <Card>
            <CardContent>
                <Typography variant="h5">Login Required</Typography>
                <Typography color="red" fontWeight="bold" gutterBottom>By order of the A.T.M, you must be logged in to
                    see this information.</Typography>
                <LoginButton session={session}/>
            </CardContent>
        </Card>;

    }

    const params = await props.params;

    const {id} = params;

    const event = await prisma.event.findUnique({
        where: {
            id,
            hidden: false,
        },
    });

    if (!event) {
        notFound();
    }

    const imageUrl = event.bannerKey && `https://utfs.io/f/${event.bannerKey}`;

    const eventPosition = await prisma.eventPosition.findUnique({
        where: {
            eventId_userId: {
                eventId: event.id,
                userId: session?.user.id || '',
            },
        },
    });

    return (
        <Container maxWidth="md">
            <Stack direction="column" spacing={2}>
                <Card>
                    <CardContent>
                        <Grid2 container columns={2} spacing={2}>
                            <Grid2 size={2}>
                                <Box sx={{position: 'relative', width: '100%', minHeight: 400,}}>
                                    <Image
                                        src={imageUrl || Placeholder}
                                        alt={event.name} priority fill style={{objectFit: 'contain'}}/>
                                </Box>
                            </Grid2>
                            <Grid2 size={2}>
                                <Stack direction="column" spacing={1} sx={{mb: 4,}}>
                                    <Typography variant="h5">{event.name}</Typography>
                                    <Typography variant="subtitle1">
                                        {formatZuluDate(event.start)}
                                        - {formatZuluDate(event.end)}
                                    </Typography>
                                    <Typography
                                        variant="subtitle2">{event.featuredFields.join(" • ") || 'No fields'}</Typography>
                                </Stack>
                                <Markdown>{event.description}</Markdown>
                            </Grid2>
                        </Grid2>
                    </CardContent>
                </Card>
                { session?.user && session.user.controllerStatus !== 'NONE' && !session.user.noEventSignup && !eventPosition?.published && <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Request Position</Typography>
                        <EventPositionRequestForm event={event} eventPosition={eventPosition} currentUser={session.user as User} />
                    </CardContent>
                </Card> }
                { session?.user && session.user.controllerStatus !== 'NONE' && !session.user.noEventSignup && eventPosition?.published && <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Your Position Assignment</Typography>
                        <Typography variant="h5" textAlign="center">{eventPosition.finalPosition}</Typography>
                        <Typography variant="subtitle2" textAlign="center" gutterBottom>{formatZuluDate(eventPosition.finalStartTime || event.start)} - {formatZuluDate(eventPosition.finalEndTime || event.end)}</Typography>
                        <Typography textAlign="center" sx={{ mb: 4 }}>{eventPosition.finalNotes}</Typography>
                        <Typography variant="caption">Contact the events team if you have any questions.</Typography>
                    </CardContent>
                </Card>}
            </Stack>
        </Container>
    );
}

