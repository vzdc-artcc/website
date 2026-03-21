// app/events/ops/page.tsx
import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/db';
import { formatZuluDate } from '@/lib/date';
import Placeholder from '@/public/img/logo_large.png';
import {
    Box,
    Card,
    CardContent,
    Container,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import Image from "next/image";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page() {
    const events = await prisma.event.findMany({
        where: {
            opsPlanPublished: true,
            hidden: false
        },
        orderBy: {
            start: 'asc',
        },
    });

    const session = await getServerSession(authOptions);

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Published OPS Plans
            </Typography>
            {events.length === 0 ? (
                <Paper elevation={2} sx={{ p: 4 }}>
                    <Stack spacing={1}>
                        <Typography variant="h6">No published OPS plans</Typography>
                        <Typography color="text.secondary">
                            There are currently no published operations plans. When an event planner publishes an ops plan it will appear here for controllers to view.
                        </Typography>
                    </Stack>
                </Paper>
            ) : (
                <Stack direction="column" spacing={2}>
                    {events.slice(0, 10).map(async (event) => (
                        <Card key={event.id}>
                            <CardContent>
                                <Link href={`/events/${event.id}/ops`} style={{color: 'inherit', textDecoration: 'none',}}>
                                    <Box sx={{position: 'relative', width: '100%', minHeight: 200,}}>
                                        <Image src={event.bannerKey ? `https://utfs.io/f/${event.bannerKey}` : Placeholder}
                                               alt={event.name} fill style={{objectFit: 'contain'}}/>
                                    </Box>
                                </Link>
                                <Typography variant="h5">{event.name}</Typography>
                                <Typography
                                    variant="subtitle2">{formatZuluDate(event.start)} - {formatZuluDate(event.end).substring(9)}</Typography>
                                <Typography variant="subtitle2">{event.featuredFields.join(', ')}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Container>
    );
}
