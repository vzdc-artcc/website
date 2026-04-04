'use client'
import React, {useState} from 'react';
import {TrainingAssignment} from "@/generated/prisma/browser";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {deleteTrainingAssignment} from "@/actions/trainingAssignment";
import {GridActionsCellItem} from "@mui/x-data-grid";

export default function TrainingAssignmentDeleteButton({assignment, noTable = false,}: {
    assignment: TrainingAssignment,
    noTable?: boolean,
}) {
    const [clicked, setClicked] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        if (clicked) {
            await deleteTrainingAssignment(assignment.id);
            toast(`Training assignment deleted successfully!`, {type: 'success'});
            router.replace('/training/requests');
        } else {
            toast(`Click again to confirm deletion.`, {type: 'warning'});
            setClicked(true);
        }

    }

    if (noTable) {
        return (
            <Tooltip title="Delete Training Assignment">
                <IconButton onClick={handleClick}>
                    <Delete color={clicked ? "warning" : "inherit"}/>
                </IconButton>
            </Tooltip>
        );
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