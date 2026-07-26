'use client';
import React from 'react';
import {useSearchParams} from "next/navigation";
import {Alert, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {useDiscordBundle} from "@/lib/osmium/hooks/discord";
import DiscordChannelForm from "@/components/Discord/DiscordChannelForm";

export default function Page() {
    const searchParams = useSearchParams();
    const discordConfigId = searchParams.get('discordConfigId');
    const {data: bundle, isLoading} = useDiscordBundle();

    if (isLoading) {
        return <CircularProgress/>;
    }

    const config = bundle?.configs.find((c) => c.id === discordConfigId);
    if (!config) {
        return <Alert severity="error">Discord config not found.</Alert>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">New Channel</Typography>
                <Typography variant="subtitle2" sx={{mb: 2,}}>{config.name}</Typography>
                <DiscordChannelForm discordConfigId={config.id}/>
            </CardContent>
        </Card>
    );
}
