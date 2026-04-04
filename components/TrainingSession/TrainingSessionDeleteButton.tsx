'use client';
import React, {useState} from 'react';
import {TrainingSession} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteTrainingSession} from "@/actions/trainingSession";
import {GridActionsCellItem} from "@mui/x-data-grid";

export default function TrainingSessionDeleteButton({trainingSession}: { trainingSession: TrainingSession, }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteTrainingSession(trainingSession.id);
            toast(`Training session deleted successfully!`, {type: 'success'});
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