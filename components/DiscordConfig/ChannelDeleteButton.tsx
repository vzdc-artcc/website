'use client';
import React, {useState} from 'react';
import {DiscordChannel} from "@prisma/client";
import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {deleteChannel} from "@/actions/discordConfig";

export default function ChannelDeleteButton({channel}: { channel: DiscordChannel, }) {

    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteChannel(channel.id);
            toast(`Channel: '${channel.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete '${channel.name}'?  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete">
            <IconButton onClick={handleClick}>
                {clicked ? <Delete color="warning"/> : <Delete/>}
            </IconButton>
        </Tooltip>
    );
}