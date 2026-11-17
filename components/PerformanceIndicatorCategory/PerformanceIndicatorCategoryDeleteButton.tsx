'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDeletePerformanceIndicatorCategory} from "@/lib/osmium/hooks/training";

export default function PerformanceIndicatorCategoryDeleteButton({category}: {
    category: { id: string, name: string }
}) {
    const [clicked, setClicked] = useState(false);
    const deleteCategory = useDeletePerformanceIndicatorCategory();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteCategory.mutateAsync(category.id);
            } catch {
                toast(`Failed to delete category.`, {type: 'error'});
                return;
            }
            toast(`'${category.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`This will delete all the entries in it.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick} disabled={deleteCategory.isPending}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}
