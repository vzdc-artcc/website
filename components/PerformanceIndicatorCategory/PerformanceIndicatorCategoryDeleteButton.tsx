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
            await deleteCategory.mutateAsync(category.id);
            toast(`'${category.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`This will delete all the entries in it.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}
