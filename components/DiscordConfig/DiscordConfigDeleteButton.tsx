'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {DiscordConfig} from "@prisma/client";
import {deleteDiscordConfig} from "@/actions/discordConfig";

export default function DiscordConfigDeleteButton({discordConfig}: { discordConfig: DiscordConfig }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteDiscordConfig(discordConfig.id);
            toast(`Discord Config '${discordConfig.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete '${discordConfig.name}'?  This will delete ALL channels, roles, etc contained inside it.  Click again to confirm.`, {type: 'warning'});
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