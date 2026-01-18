'use client';
import React, {useState} from 'react';
import {DiscordRole} from "@prisma/client";
import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {deleteRole} from "@/actions/discordConfig";


export default function RoleDeleteButton({role}: { role: DiscordRole, }) {

    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteRole(role.id);
            toast(`Role: '${role.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete '${role.name}'?  Click again to confirm.`, {type: 'warning'});
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