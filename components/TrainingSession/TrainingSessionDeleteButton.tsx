'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDeleteTrainingSession} from "@/lib/osmium/hooks/training";

export default function TrainingSessionDeleteButton({sessionId}: { sessionId: string, }) {
    const [clicked, setClicked] = useState(false);
    const deleteSession = useDeleteTrainingSession();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteSession.mutateAsync(sessionId);
                toast(`Training session deleted successfully!`, {type: 'success'});
            } catch {
                toast(`Failed to delete training session.`, {type: 'error'});
            }
        } else {
            toast(`Deleting this remove it from all records.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Training Session">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Training Session"
                onClick={handleClick}
            />
        </Tooltip>
    );
}