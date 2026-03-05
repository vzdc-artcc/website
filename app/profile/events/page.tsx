import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import prisma from "@/lib/db";
import {
    Box,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {formatTimezoneDate} from "@/lib/date";
import {KeyboardArrowLeft} from "@mui/icons-material";
import Link from "next/link";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const events = await prisma.eventPosition.findMany({
        where: {
            userId: session?.user.id || '',
            published: true,
        },
        select: {
            id: true,
            requestedPosition: true,
            finalPosition: true,
            finalStartTime: true,
            finalEndTime: true,
            event: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            event: {
                start: 'desc',
            }
        }
    });

    return session?.user && (
        <Box>
            <Link href="/profile/overview" style={{color: 'inherit',}}>
                <Button color="inherit" startIcon={<KeyboardArrowLeft/>} sx={{mb: 2,}}>Profile</Button>
            </Link>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Your Previous Events</Typography>
                    {events.length === 0 && <Typography>You have no previously published event positions.</Typography>}
                    {events.length > 0 && <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Event</TableCell>
                                    <TableCell>Position Time</TableCell>
                                    <TableCell>Requested Position</TableCell>
                                    <TableCell>Final Position</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {events.map((position) => (
                                    <TableRow key={position.id}>
                                        <TableCell>{position.event.name}</TableCell>
                                        <TableCell>{formatTimezoneDate(position.finalStartTime || new Date(), session.user.timezone)} - {formatTimezoneDate(position.finalEndTime || new Date(), session.user.timezone)}</TableCell>
                                        <TableCell>{position.requestedPosition}</TableCell>
                                        <TableCell>{position.finalPosition}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>}
                </CardContent>
            </Card>
        </Box>
    );
}