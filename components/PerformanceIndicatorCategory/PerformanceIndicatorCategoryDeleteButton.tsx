'use client';
import React, {useState} from 'react';
import {PerformanceIndicatorCriteriaCategory} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deletePerformanceIndicatorCategory} from "@/actions/performanceIndicatorCategory";

export default function PerformanceIndicatorCategoryDeleteButton({category}: {
    category: PerformanceIndicatorCriteriaCategory
}) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deletePerformanceIndicatorCategory(category.id);
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