'use client';
import React from 'react';
import {Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {FileOpen, KeyboardArrowLeft} from "@mui/icons-material";
import Markdown from "react-markdown";
import {formatZuluDate} from "@/lib/date";
import {useMyBroadcasts} from "@/lib/osmium/hooks/broadcasts";

export default function Page() {

    const {data, isLoading} = useMyBroadcasts();
    const broadcasts = data?.items ?? [];

    return (
        <Box>
            <Link href="/profile/overview" style={{color: 'inherit',}}>
                <Button color="inherit" startIcon={<KeyboardArrowLeft/>} sx={{mb: 2,}}>Profile</Button>
            </Link>
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>Facility Broadcasts</Typography>
                    {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>}
                    <Grid container columns={4} spacing={2} sx={{mt: 2,}}>
                        {broadcasts.map((broadcast) => (
                            <Grid key={broadcast.id} size={{xs: 4, md: 2, xl: 1}}>
                                <Card variant="outlined" sx={{
                                    height: '100%',
                                    borderColor: broadcast.agreed_at ? undefined : 'red',
                                }}>
                                    <CardContent sx={{maxHeight: 300, overflow: 'auto',}}>
                                        <Typography variant="caption">{formatZuluDate(new Date(broadcast.timestamp))}</Typography>
                                        <Typography variant="h6" gutterBottom>{broadcast.title}</Typography>
                                        <Markdown>{broadcast.description}</Markdown>
                                        {broadcast.file_id && (
                                            <Box sx={{mt: 2,}}>
                                                <Link href={`/publications/${broadcast.file_id}`} target="_blank"
                                                      style={{color: 'inherit',}}>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <FileOpen/>
                                                        <Typography variant="subtitle2">
                                                            {broadcast.file_filename}
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
