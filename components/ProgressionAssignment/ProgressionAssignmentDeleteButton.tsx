'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDeleteProgressionAssignment} from "@/lib/osmium/hooks/training";

export default function ProgressionAssignmentDeleteButton({user}: {
    user: { user_id: string },
}) {
    const [clicked, setClicked] = useState(false);
    const deleteAssignment = useDeleteProgressionAssignment();

    const handleClick = async () => {
        if (clicked) {
            await deleteAssignment.mutateAsync(user.user_id);
            toast(`Training assign deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting this remove it from this user but will NOT affect any existing training sessions.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Training Assignment">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Training Assignment"
                onClick={handleClick}
            />
        </Tooltip>
    );
}
