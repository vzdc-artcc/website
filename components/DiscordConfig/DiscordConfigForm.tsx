'use client';
import React from 'react';
import {DiscordConfig} from "@prisma/client";
import {Stack, TextField} from "@mui/material";
import {toast} from "react-toastify";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {upsertDiscordConfig} from "@/actions/discordConfig";

export default function DiscordConfigForm({discordConfig}: { discordConfig?: DiscordConfig }) {

    const handleSubmit = async (formData: FormData) => {

        const {discordConfig: savedDiscordConfig, errors} = await upsertDiscordConfig(formData);
        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'});
            return;
        }
        toast(`Discord Config '${savedDiscordConfig.name}' saved successfully!`, {type: 'success'});
        
    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="id" value={discordConfig?.id}/>
            <Stack direction="column" spacing={2}>
                <TextField fullWidth variant="filled" label="Name*" name="name" defaultValue={discordConfig?.name || ''}/>
                <TextField fullWidth variant="filled" label="Guild ID*" name="guildId" defaultValue={discordConfig?.guildId || ''} />
                <FormSaveButton />
            </Stack>
        </form>
    );
}