'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDeleteTrainingProgression} from "@/lib/osmium/hooks/training";

export default function TrainingProgressionDeleteButton({trainingProgression}: {
    trainingProgression: { id: string },
}) {
    const [clicked, setClicked] = useState(false);
    const deleteProgression = useDeleteTrainingProgression();

    const handleClick = async () => {
        if (clicked) {
            try {
                await deleteProgression.mutateAsync(trainingProgression.id);
            } catch {
                toast(`Failed to delete training progression.`, {type: 'error'});
                return;
            }
            toast(`Training progression deleted successfully!`, {type: 'success'});
        } else {
            toast(`Deleting this remove it from all students and delete all the steps.  Click again to confirm.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Training Progression">
            <GridActionsCellItem
                disabled={deleteProgression.isPending}
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Training Progression"
                onClick={handleClick}
            />
        </Tooltip>
    );
}
