'use client';
import React from 'react';
import {useParams} from "next/navigation";
import {Alert, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {useDiscordBundle} from "@/lib/osmium/hooks/discord";
import DiscordConfigForm from "@/components/Discord/DiscordConfigForm";

export default function Page() {
    const params = useParams<{ configId: string }>();
    const {data: bundle, isLoading} = useDiscordBundle();

    if (isLoading) {
        return <CircularProgress/>;
    }

    const config = bundle?.configs.find((c) => c.id === params.configId);
    if (!config) {
        return <Alert severity="error">Discord config not found.</Alert>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>Edit Discord Config</Typography>
                <DiscordConfigForm config={config}/>
            </CardContent>
        </Card>
    );
}
