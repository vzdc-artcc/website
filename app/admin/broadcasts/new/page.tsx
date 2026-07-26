'use client';
import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import BroadcastForm from "@/components/Broadcast/BroadcastForm";
import {usePublications} from "@/lib/osmium/hooks/publications";

export default function Page() {
    const {data} = usePublications({pageSize: 200});
    const allFiles = (data?.items ?? []).map((p) => ({id: p.id, title: p.title}));

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New Broadcast</Typography>
                <BroadcastForm allFiles={allFiles}/>
            </CardContent>
        </Card>
    );

}
