import React from 'react';
import {User} from "next-auth";
import {
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import prisma from '@/lib/db';
import {formatTimezoneDate} from '@/lib/date';
import Link from 'next/link';
import {Check, Close, Edit, KeyboardArrowRight, Visibility} from '@mui/icons-material';

export default async function EventsCard({user}: { user: User, }) {

    const positions = await prisma.eventPosition.findMany({
        where: {
            userId: user.id,
            event: {
                archived: null,
                hidden: false,
            },
        },
        include: {
            event: true,
        },
        orderBy: {
            event: {
                start: 'asc',
            },
        },
    });

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography variant="h6" sx={{mb: 1,}}>Events</Typography>
                {positions.length === 0 && <Typography>You are not signed up for any events.</Typography>}
                {positions.length > 0 && <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Event</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Final?</TableCell>
                                <TableCell>Start</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {positions.map((position) => (
                                <TableRow key={position.id}>
                                    <TableCell>{position.event.name}</TableCell>
                                    <TableCell>{position.published ? position.finalPosition : position.requestedPosition}</TableCell>
                                    <TableCell>{position.published ? <Check /> : <Close />}</TableCell>
                                    <TableCell>{formatTimezoneDate(position.published ? position.finalStartTime || new Date() : position.event.start, user.timezone)}</TableCell>
                                    <TableCell>
                                        <Link href={`/events/${position.eventId}`}>
                                            <IconButton>
                                                { position.published ? <Visibility /> : <Edit /> }
                                            </IconButton>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>}
                <Stack direction="row" justifyContent="flex-end" sx={{mt: 2,}}>
                    <Link href="/profile/events" style={{color: 'inherit', textDecoration: 'none',}}>
                        <Button color="inherit" endIcon={<KeyboardArrowRight/>}>Previous events</Button>
                    </Link>
                </Stack>
            </CardContent>
        </Card>
    );
}