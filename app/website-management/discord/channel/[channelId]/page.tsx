'use client';
import React from 'react';
import {useParams} from "next/navigation";
import {Alert, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {useDiscordBundle} from "@/lib/osmium/hooks/discord";
import DiscordChannelForm from "@/components/Discord/DiscordChannelForm";

export default function Page() {
    const params = useParams<{ channelId: string }>();
    const {data: bundle, isLoading} = useDiscordBundle();

    if (isLoading) {
        return <CircularProgress/>;
    }

    const channel = bundle?.channels.find((c) => c.id === params.channelId);
    if (!channel) {
        return <Alert severity="error">Channel not found.</Alert>;
    }

    const guildId = bundle?.configs.find((c) => c.id === channel.discord_config_id)?.guild_id;

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>{channel.name}</Typography>
                <DiscordChannelForm discordConfigId={channel.discord_config_id} channel={channel}
                                    guildId={guildId}/>
            </CardContent>
        </Card>
    );
}
