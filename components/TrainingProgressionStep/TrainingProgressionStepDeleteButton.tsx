'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDeleteTrainingProgressionStep} from "@/lib/osmium/hooks/training";

export default function TrainingProgressionStepDeleteButton({trainingProgressionStep}: {
    trainingProgressionStep: { id: string },
}) {
    const [clicked, setClicked] = useState(false);
    const deleteStep = useDeleteTrainingProgressionStep();

    const handleClick = async () => {
        if (clicked) {
            await deleteStep.mutateAsync(trainingProgressionStep.id);
            toast(`Training progression step deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting this remove it from all students and progressions.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Training Progression Step">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Training Progression Step"
                onClick={handleClick}
            />
        </Tooltip>
    );
}
