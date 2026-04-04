'use client';
import React, {useState} from 'react';
import {TrainingProgression} from "@/generated/prisma/browser";
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {deleteTrainingProgression} from "@/actions/trainingProgression";

export default function TrainingProgressionDeleteButton({trainingProgression}: {
    trainingProgression: TrainingProgression,
}) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            await deleteTrainingProgression(trainingProgression.id);
            toast(`Training progression deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting this remove it from all students and delete all the steps.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Training Progression">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Training Progression"
                onClick={handleClick}
            />
        </Tooltip>
    );
}