import React from 'react';
import {User} from "next-auth";
import {
    Card,
    CardContent,
    IconButton,
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
import {Check, Close, Edit, Visibility} from '@mui/icons-material';

export default async function EventSignupCard({user}: { user: User, }) {

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
                <Typography variant="h6" sx={{mb: 1,}}>Event Signups</Typography>
                {positions.length === 0 && <Typography>You are not signed up for any events.</Typography>}
                {positions.length > 0 && <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Event Name</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Final</TableCell>
                                <TableCell>Start (for you)</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {positions.map((position) => (
                                <TableRow key={position.id}>
                                    <TableCell>{position.event.name}</TableCell>
                                    <TableCell>{position.published ? position.finalPosition : position.requestedPosition}</TableCell>
                                    <TableCell>{position.published ? <Check /> : <Close />}</TableCell>
                                    <TableCell>{formatTimezoneDate(position.finalStartTime || position.event.start, user.timezone)}</TableCell>
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
            </CardContent>
        </Card>
    );
}