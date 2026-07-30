'use client';
import React from 'react';
import {Stack, TextField} from "@mui/material";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateDiscordConfig, useDiscordGuilds, useUpdateDiscordConfig} from "@/lib/osmium/hooks/discord";
import DiscordResourceSelect from "@/components/Discord/DiscordResourceSelect";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordConfigForm({config}: { config?: components["schemas"]["DiscordConfigItem"] }) {
    const createConfig = useCreateDiscordConfig();
    const updateConfig = useUpdateDiscordConfig();
    const {data: guilds, isLoading: guildsLoading, isError: guildsError} = useDiscordGuilds();

    // Memoized on the discovery payload so the option array's identity is stable
    // across unrelated re-renders (keeps DiscordResourceSelect's label-upgrade
    // effect from firing every keystroke).
    const guildOptions = React.useMemo(
        () => (guilds?.guilds ?? []).map((g) => ({id: g.id, label: `${g.name} (${g.id})`})),
        [guilds],
    );

    const handleSubmit = async (formData: FormData) => {
        const name = (formData.get('name') as string || '').trim();
        const guildId = (formData.get('guildId') as string || '').trim();

        try {
            if (config) {
                await updateConfig.mutateAsync({
                    configId: config.id,
                    body: {name, guild_id: guildId ? guildId : null},
                });
            } else {
                await createConfig.mutateAsync({name, guild_id: guildId || undefined});
            }
            toast(`Discord Config '${name}' saved successfully!`, {type: 'success'});
        } catch {
            toast('Failed to save Discord config.', {type: 'error'});
        }
    };

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <TextField fullWidth required variant="filled" label="Name" name="name"
                           defaultValue={config?.name}/>
                <DiscordResourceSelect
                    name="guildId"
                    label="Guild"
                    options={guildOptions}
                    defaultId={config?.guild_id}
                    loading={guildsLoading}
                    helperText={guildsError
                        ? "Couldn't reach the Discord bot — enter a guild ID manually."
                        : "Pick the server the bot is in, or type an ID."}
                />
                <FormSaveButton/>
            </Stack>
        </form>
    );
}
