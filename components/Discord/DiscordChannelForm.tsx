'use client';
import React from 'react';
import {Grid, TextField} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateDiscordChannel, useUpdateDiscordChannel} from "@/lib/osmium/hooks/discord";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordChannelForm({channel, discordConfigId}: {
    channel?: components["schemas"]["DiscordChannelItem"],
    discordConfigId: string
}) {
    const router = useRouter();
    const createChannel = useCreateDiscordChannel();
    const updateChannel = useUpdateDiscordChannel();

    const handleSubmit = async (formData: FormData) => {
        const name = (formData.get('name') as string || '').trim();
        const channelId = (formData.get('channelId') as string || '').trim();

        try {
            if (channel) {
                await updateChannel.mutateAsync({channelId: channel.id, body: {name, channel_id: channelId}});
            } else {
                await createChannel.mutateAsync({discord_config_id: discordConfigId, name, channel_id: channelId});
            }
            toast(`Channel '${name}' saved successfully!`, {type: 'success'});
            if (!channel) {
                router.push(`/website-management/discord/channel/new?discordConfigId=${discordConfigId}`);
            }
        } catch {
            toast('Failed to save channel.', {type: 'error'});
        }
    };

    return (
        <form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid size={{xs: 2, sm: 1}}>
                    <TextField fullWidth required variant="filled" label="Name" name="name"
                               defaultValue={channel?.name}/>
                </Grid>
                <Grid size={{xs: 2, sm: 1}}>
                    <TextField fullWidth required variant="filled" label="Channel ID" name="channelId"
                               defaultValue={channel?.channel_id}/>
                </Grid>
                <Grid size={2}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>
    );
}
