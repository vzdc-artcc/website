'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useDeletePerformanceIndicatorCriteria} from "@/lib/osmium/hooks/training";

export default function PerformanceIndicatorCriteriaDeleteButton({criteria}: {
    criteria: { id: string, name: string }
}) {
    const [clicked, setClicked] = useState(false);
    const deleteCriteria = useDeletePerformanceIndicatorCriteria();

    const handleClick = async () => {
        if (clicked) {
            await deleteCriteria.mutateAsync(criteria.id);
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
