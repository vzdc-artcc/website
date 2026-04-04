'use client';
import React, {useState} from 'react';
import {TraconGroup} from "@/generated/prisma/browser";
import {deleteTraconGroup} from "@/actions/airports";
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";

export default function TraconGroupDeleteButton({traconGroup}: { traconGroup: TraconGroup }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteTraconGroup(traconGroup.id);
            toast(`TRACON Group '${traconGroup.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete '${traconGroup.name}'?  This will delete ALL airports contained inside it.  Click again to confirm.`, {type: 'warning'});
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