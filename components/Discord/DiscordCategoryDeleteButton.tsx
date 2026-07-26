'use client';
import React, {useState} from 'react';
import {Delete} from "@mui/icons-material";
import {IconButton, Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {useDeleteDiscordCategory} from "@/lib/osmium/hooks/discord";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordCategoryDeleteButton({category}: { category: components["schemas"]["DiscordCategoryItem"] }) {
    const [clicked, setClicked] = useState(false);
    const deleteCategory = useDeleteDiscordCategory();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteCategory.mutateAsync(category.id);
                toast(`Category '${category.name}' deleted successfully!`, {type: 'success'});
            } catch {
                toast('Failed to delete category.', {type: 'error'});
            }
        } else {
            toast(`Are you sure you want to delete '${category.name}'?  Click again to confirm.`, {type: 'warning'});
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
