'use client';
import React from 'react';
import {Stack, TextField} from "@mui/material";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateDiscordConfig, useUpdateDiscordConfig} from "@/lib/osmium/hooks/discord";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordConfigForm({config}: { config?: components["schemas"]["DiscordConfigItem"] }) {
    const createConfig = useCreateDiscordConfig();
    const updateConfig = useUpdateDiscordConfig();

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
                <TextField fullWidth variant="filled" label="Guild ID" name="guildId"
                           defaultValue={config?.guild_id ?? ''}/>
                <FormSaveButton/>
            </Stack>
        </form>
    );
}
