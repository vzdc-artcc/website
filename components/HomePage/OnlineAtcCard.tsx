'use client';
import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {getDuration} from "@/lib/date";
import {useOnlineControllers} from "@/lib/osmium/hooks/stats";

export default function OnlineAtcCard() {
    const {data} = useOnlineControllers();
    const online = data?.items ?? [];

    return (
        <Card sx={{height: '50%', overflowY: 'auto',}}>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Online ATC</Typography>
                <Stack direction="column" spacing={1}>
                    {online.length > 0 ? online.map((position) => (
                        <Card elevation={0} key={position.position + position.cid}>
                            <CardContent>
                                <Stack direction="row" spacing={1} justifyContent="space-between">
                                    <Typography>{position.position}</Typography>
                                    <Typography>{getDuration(new Date(position.start), new Date())}</Typography>
                                </Stack>
                                <Link href={`/controllers/${position.cid}`}
                                      style={{textDecoration: 'none', color: 'inherit',}}>
                                    <Typography variant="subtitle2">
                                        {position.display_name}{position.rating ? ` - ${position.rating}` : ''}
                                    </Typography>
                                </Link>
                            </CardContent>
                        </Card>
                    )) : <Typography>No controllers online</Typography>}
                </Stack>
            </CardContent>
        </Card>
    );
}
