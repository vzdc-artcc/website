'use client';
import React from 'react';
import {
    Button,
    Card,
    CardContent,
    CircularProgress,
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
import {formatTimezoneDate} from '@/lib/date';
import Link from 'next/link';
import {KeyboardArrowRight, Visibility} from '@mui/icons-material';
import {useUserEventPositions} from "@/lib/osmium/hooks/events";

export default function EventsCard({cid, timezone}: { cid: number, timezone: string, }) {

    const {data, isLoading} = useUserEventPositions(cid);
    const positions = data?.items ?? [];

    if (isLoading) {
        return <CircularProgress/>;
    }

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
                                <TableCell>Start</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {positions.map((position) => (
                                <TableRow key={position.id}>
                                    <TableCell>{position.event_title}</TableCell>
                                    <TableCell>{position.final_position || 'Pending'}</TableCell>
                                    <TableCell>{formatTimezoneDate(new Date(position.final_start_time || position.event_starts_at), timezone)}</TableCell>
                                    <TableCell>
                                        <Link href={`/events/${position.event_id}`}>
                                            <IconButton>
                                                <Visibility/>
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
