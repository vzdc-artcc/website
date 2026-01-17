'use client';
import React, {useState} from 'react';
import {DiscordCategory} from "@prisma/client";
import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {deleteCategory} from "@/actions/discordConfig";

export default function CategoryDeleteButton({category}: { category: DiscordCategory, }) {

    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteCategory(category.id);
            toast(`Channel: '${category.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`Are you sure you want to delete '${category.name}'?  Click again to confirm.`, {type: 'warning'});
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