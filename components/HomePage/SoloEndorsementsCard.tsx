'use client';
import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {useAdminSoloCertifications} from "@/lib/osmium/hooks/certifications";

export default function SoloEndorsementsCard() {
    // Active solos come from the admin solo list; for signed-out visitors this
    // resolves to an empty card (there is no public all-solos endpoint).
    const {data} = useAdminSoloCertifications();
    const now = Date.now();
    const solos = (data?.items ?? []).filter((s) => new Date(s.expires).getTime() > now);

    return (
        <Card sx={{height: 600, overflowY: 'auto',}}>
            <CardContent>
                <Typography variant="h5" sx={{mb: 1,}}>Solo Endorsements</Typography>
                <Stack direction="column" spacing={1}>
                    {solos.length > 0 ? solos.map((solo) => (
                        <Card elevation={0} key={solo.id}>
                            <CardContent>
                                <Typography variant="h6">{solo.position}</Typography>
                                <Typography variant="body2">Expires {new Date(solo.expires).toDateString()}</Typography>
                                <Link href={`/controllers/${solo.cid}`}
                                      style={{textDecoration: 'none', color: 'inherit',}}>
                                    <Typography variant="subtitle2">{solo.display_name}</Typography>
                                </Link>
                            </CardContent>
                        </Card>
                    )) : <Typography>No active solo endorsements</Typography>}
                </Stack>
            </CardContent>
        </Card>
    );
}
