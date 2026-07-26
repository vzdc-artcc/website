'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDeleteDiscordConfig} from "@/lib/osmium/hooks/discord";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordConfigDeleteButton({config}: { config: components["schemas"]["DiscordConfigItem"] }) {
    const [clicked, setClicked] = useState(false);
    const deleteConfig = useDeleteDiscordConfig();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteConfig.mutateAsync(config.id);
                toast(`Discord Config '${config.name}' deleted successfully!`, {type: 'success'});
            } catch {
                toast('Failed to delete Discord config.', {type: 'error'});
            }
        } else {
            toast(`Are you sure you want to delete '${config.name}'?  This will delete ALL channels, roles, and categories contained inside it.  Click again to confirm.`, {type: 'warning'});
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
