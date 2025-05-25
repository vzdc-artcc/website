import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {
    Box,
    Card,
    CardContent,
    Container,
    Grid2,
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
import {getServerSession} from 'next-auth';
import {authOptions} from '@/auth/auth';
import EventPositionRequestForm from '@/components/EventPosition/EventPositionRequestForm';
import {User} from '@prisma/client';

export default async function Page(props: { params: Promise<{ id: string }> }) {

    const session = await getServerSession(authOptions);

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
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    const otherEventPositions = await prisma.eventPosition.findMany({
        where: {
            eventId: event.id,
            userId: {
                not: session?.user.id,
            },
            published: true,
        },
        orderBy: {
            user: {
                lastName: 'asc',
            },
        },
        include: {
            user: {
                select: {
                    firstName: true,
                    lastName: true,
                },
            },
        },
    });

    const allPositions = [...otherEventPositions, eventPosition].filter(Boolean).filter(position => position?.published);

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
                                    {session?.user && <Typography variant="subtitle1">
                                        {formatTimezoneDate(event.start, session?.user.timezone)}
                                        - {formatTimezoneDate(event.end, session?.user.timezone)}
                                    </Typography>}
                                    {!session?.user && <Typography variant="subtitle1">
                                        {formatZuluDate(event.start)}
                                        - {formatZuluDate(event.end)}
                                    </Typography>}
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
                        <Typography variant="subtitle2" textAlign="center"
                                    gutterBottom>{formatTimezoneDate(eventPosition.finalStartTime || event.start, session.user.timezone)} - {formatTimezoneDate(eventPosition.finalEndTime || event.end, session.user.timezone)}</Typography>
                        <Typography textAlign="center" sx={{ mb: 4 }}>{eventPosition.finalNotes}</Typography>
                        <Typography variant="caption">Contact the events team if you have any questions.</Typography>
                    </CardContent>
                </Card>}
                {session && <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Published Positions</Typography>
                        {allPositions.length === 0 && <Typography>No positions have been published.</Typography>}
                        {allPositions.length > 0 && <TableContainer>
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
                                    {allPositions.map((position) => (
                                        <TableRow key={position?.id}>
                                            <TableCell>
                                                {position?.user?.firstName} {position?.user?.lastName}
                                            </TableCell>
                                            <TableCell>{position?.finalPosition}</TableCell>
                                            <TableCell>{position?.finalStartTime?.getTime() === event.start.getTime() ? 'EVENT' : formatTimezoneDate(position?.finalStartTime || event.start, session.user.timezone)}</TableCell>
                                            <TableCell>{position?.finalEndTime?.getTime() === event.end.getTime() ? 'EVENT' : formatTimezoneDate(position?.finalEndTime || event.end, session.user.timezone)}</TableCell>
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

