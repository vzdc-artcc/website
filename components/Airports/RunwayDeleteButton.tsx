'use client';
import React, {useState} from 'react';
import {Runway} from "@/generated/prisma/browser";
import {deleteRunway} from "@/actions/airports";
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";

export default function RunwayDeleteButton({runway}: { runway: Runway }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteRunway(runway.id);
            toast(`Runway '${runway.name}' deleted successfully`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete runway '${runway.name}'?  Click again to confirm.`, {type: 'warning'});
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