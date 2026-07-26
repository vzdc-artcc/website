'use client';
import React from 'react';
import {useParams} from 'next/navigation';
import {Box, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import BroadcastForm from "@/components/Broadcast/BroadcastForm";
import {useAdminBroadcastDetail} from "@/lib/osmium/hooks/broadcasts";
import {usePublications} from "@/lib/osmium/hooks/publications";

export default function Page() {
    const params = useParams<{ id: string }>();
    const {data: broadcast, isLoading, isError} = useAdminBroadcastDetail(params.id);
    const {data: publicationsData} = usePublications({pageSize: 200});
    const allFiles = (publicationsData?.items ?? []).map((p) => ({id: p.id, title: p.title}));

    if (isLoading) {
        return <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}><CircularProgress/></Box>;
    }

    if (isError || !broadcast) {
        return <Typography>Broadcast not found.</Typography>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Edit Broadcast - {broadcast.title}</Typography>
                <BroadcastForm allFiles={allFiles} broadcast={broadcast}/>
            </CardContent>
        </Card>
    );
}
