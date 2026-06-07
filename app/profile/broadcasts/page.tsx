import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {notFound} from "next/navigation";
import prisma from "@/lib/db";
import {Box, Button, Card, CardContent, Grid, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {FileOpen, KeyboardArrowLeft} from "@mui/icons-material";
import Markdown from "react-markdown";
import {formatZuluDate} from "@/lib/date";

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session?.user) {
        notFound();
    }

    const broadcasts = await prisma.changeBroadcast.findMany({
        where: {
            OR: [
                {
                    agreedBy: {
                        some: {
                            id: session.user.id,
                        },
                    },
                },
                {
                    seenBy: {
                        some: {
                            id: session.user.id,
                        },
                    },
                },
                {
                    unseenBy: {
                        some: {
                            id: session.user.id,
                        },
                    },
                },
            ],
        },
        include: {
            file: true,
            agreedBy: {
                select: {
                    id: true,
                },
            },
        },
        orderBy: {
            timestamp: 'desc',
        },
    })

    console.log(broadcasts[1].agreedBy);

    return (
        <Box>
            <Link href="/profile/overview" style={{color: 'inherit',}}>
                <Button color="inherit" startIcon={<KeyboardArrowLeft/>} sx={{mb: 2,}}>Profile</Button>
            </Link>
            <Card>
                <CardContent>
                    <Typography variant="h5">Facility Broadcasts</Typography>
                    <Typography variant="caption" gutterBottom>Facility broadcasts are automatically deleted a few
                        months after they are published.</Typography>
                    <Grid container columns={4} spacing={2} sx={{mt: 2,}}>
                        {broadcasts.map((broadcast) => (
                            <Grid key={broadcast.id} size={{xs: 4, md: 2, xl: 1}}>
                                <Card variant="outlined" sx={{
                                    height: '100%',
                                    borderColor: broadcast.agreedBy.map((b) => b.id).includes(session.user.id) ? undefined : 'red',
                                }}>
                                    <CardContent sx={{maxHeight: 300, overflow: 'auto',}}>
                                        <Typography variant="caption">{formatZuluDate(broadcast.timestamp)}</Typography>
                                        <Typography variant="h6" gutterBottom>{broadcast.title}</Typography>
                                        <Markdown>{broadcast.description}</Markdown>
                                        {broadcast.file && (
                                            <Box sx={{mt: 2,}}>
                                                <Link href={`/publications/${broadcast.file.id}`} target="_blank"
                                                      style={{color: 'inherit',}}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <FileOpen/>
                                                        <Typography variant="subtitle2">
                                                            {broadcast.file.name}
                                                        </Typography>
                                                    </Stack>
                                                </Link>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}