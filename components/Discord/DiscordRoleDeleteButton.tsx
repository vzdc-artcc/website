'use client';
import React, {useState} from 'react';
import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {useDeleteDiscordRole} from "@/lib/osmium/hooks/discord";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordRoleDeleteButton({role}: { role: components["schemas"]["DiscordRoleItem"] }) {
    const [clicked, setClicked] = useState(false);
    const deleteRole = useDeleteDiscordRole();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteRole.mutateAsync(role.id);
                toast(`Role '${role.name}' deleted successfully!`, {type: 'success'});
            } catch {
                toast('Failed to delete role.', {type: 'error'});
            }
        } else {
            toast(`Are you sure you want to delete '${role.name}'?  Click again to confirm.`, {type: 'warning'});
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
