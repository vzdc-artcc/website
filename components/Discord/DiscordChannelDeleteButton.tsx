'use client';
import React, {useState} from 'react';
import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {useDeleteDiscordChannel} from "@/lib/osmium/hooks/discord";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordChannelDeleteButton({channel}: { channel: components["schemas"]["DiscordChannelItem"] }) {
    const [clicked, setClicked] = useState(false);
    const deleteChannel = useDeleteDiscordChannel();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteChannel.mutateAsync(channel.id);
                toast(`Channel '${channel.name}' deleted successfully!`, {type: 'success'});
            } catch {
                toast('Failed to delete channel.', {type: 'error'});
            }
        } else {
            toast(`Are you sure you want to delete '${channel.name}'?  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }
    };

    return (
        <Tooltip title="Delete">
            <IconButton onClick={handleClick}>
                {clicked ? <Delete color="warning"/> : <Delete/>}
            </IconButton>
        </Tooltip>
    );
}
