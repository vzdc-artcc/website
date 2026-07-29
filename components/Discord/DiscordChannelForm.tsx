'use client';
import React from 'react';
import {Grid} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateDiscordChannel, useUpdateDiscordChannel} from "@/lib/osmium/hooks/discord";
import DiscordResourceSelect from "@/components/Discord/DiscordResourceSelect";
import DiscordNameSelect from "@/components/Discord/DiscordNameSelect";
import {useGuildResourceOptions} from "@/components/Discord/useGuildResourceOptions";
import {KNOWN_DISCORD_CHANNEL_NAMES} from "@/components/Discord/knownNames";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordChannelForm({channel, discordConfigId, guildId}: {
    channel?: components["schemas"]["DiscordChannelItem"],
    discordConfigId: string,
    guildId?: string | null,
}) {
    const router = useRouter();
    const createChannel = useCreateDiscordChannel();
    const updateChannel = useUpdateDiscordChannel();
    const {options: channelOptions, loading: discoveryLoading, helperText} = useGuildResourceOptions('channel', guildId);

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
                    <DiscordNameSelect
                        name="name"
                        label="Name"
                        required
                        options={KNOWN_DISCORD_CHANNEL_NAMES}
                        defaultValue={channel?.name}
                        helperText="Pick a known channel key, or type your own."
                    />
                </Grid>
                <Grid size={{xs: 2, sm: 1}}>
                    <DiscordResourceSelect
                        name="channelId"
                        label="Channel"
                        required
                        options={channelOptions}
                        defaultId={channel?.channel_id}
                        loading={discoveryLoading}
                        helperText={helperText}
                    />
                </Grid>
                <Grid size={2}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>
    );
}
