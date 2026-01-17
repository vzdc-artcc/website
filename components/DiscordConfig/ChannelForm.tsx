'use client';
import React from 'react';
import {DiscordChannel} from "@prisma/client";
import {Grid2, TextField,} from "@mui/material";
import {toast} from "react-toastify";
import {upsertChannel} from "@/actions/discordConfig";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";


export default function ChannelForm({channel, discordConfigId}: { channel?: DiscordChannel, discordConfigId: string, }) {

    const router = useRouter();
    const handleSubmit = async (formData: FormData) => {

        const {channel: savedChannel, errors} = await upsertChannel(formData);
        if (errors) {
            toast(errors.map(e => e.message).join(".  "), {type: 'error'});
            return;
        }

        toast(`Channel '${savedChannel.name}' saved successfully!`, {type: 'success'});

        if (!channel) {
            router.push(`/web-system/discord-configs/channel/new?discordConfigId=${discordConfigId}`);
        }
    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="discordConfigId" value={discordConfigId} />
            <input type="hidden" name="id" value={channel?.id}/>
            <Grid2 container columns={2} spacing={2}>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="Name" name="name" defaultValue={channel?.name || ''}/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="Channel ID" name="channelId" defaultValue={channel?.channelId || ''}/>
                </Grid2>
                <Grid2 size={2}>
                    <FormSaveButton />
                </Grid2>
            </Grid2>
        </form>)
    );

}