'use client';
import React, {useState} from 'react';
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDeleteTrainingAssignment} from "@/lib/osmium/hooks/training";

export default function TrainingAssignmentDeleteButton({assignment, noTable = false,}: {
    assignment: { id: string },
    noTable?: boolean,
}) {
    const [clicked, setClicked] = useState(false);
    const router = useRouter();
    const deleteAssignment = useDeleteTrainingAssignment();

    const handleClick = async () => {
        if (clicked) {
            await deleteAssignment.mutateAsync(assignment.id);
            toast(`Training assignment deleted successfully!`, {type: 'success'});
            router.replace('/training/assignments');
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
