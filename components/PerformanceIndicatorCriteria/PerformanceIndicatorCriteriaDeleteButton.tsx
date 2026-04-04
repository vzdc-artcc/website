'use client';
import React, {useState} from 'react';
import {PerformanceIndicatorCriteria} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deletePerformanceIndicatorCriteria} from "@/actions/performanceIndicatorCriteria";

export default function PerformanceIndicatorCriteriaDeleteButton({criteria}: {
    criteria: PerformanceIndicatorCriteria
}) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deletePerformanceIndicatorCriteria(criteria.id);
            toast(`'${criteria.name}' deleted successfully!`, {type: 'success'});
        } else {
            toast(`This will delete the criteria permanently.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <IconButton onClick={handleClick}>
            {clicked ? <Delete color="warning"/> : <Delete/>}
        </IconButton>
    );
}