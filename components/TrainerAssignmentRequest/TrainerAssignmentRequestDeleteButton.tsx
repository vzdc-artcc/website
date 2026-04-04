'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {TrainingAssignmentRequest} from "@/generated/prisma/browser";
import {deleteTrainingAssignmentRequest} from "@/actions/trainingAssignmentRequest";
import {useRouter} from "next/navigation";
import {GridActionsCellItem} from "@mui/x-data-grid";

export default function TrainerAssignmentRequestDeleteButton({request, noTable = false,}: {
    request: TrainingAssignmentRequest,
    noTable?: boolean,
}) {

    const [clicked, setClicked] = useState(false);
    const router = useRouter();

    const handleClick = async () => {
        if (clicked) {
            await deleteTrainingAssignmentRequest(request.id);
            toast(`Request deleted successfully!`, {type: 'success'});
            router.replace('/training/requests');
        } else {
            toast(`Click again to confirm deletion.`, {type: 'warning'});
            setClicked(true);
        }

    }

    if (noTable) {
        return (
            <Tooltip title="Delete Trainer Request">
                <IconButton onClick={handleClick}>
                    <Delete color={clicked ? "warning" : "inherit"}/>
                </IconButton>
            </Tooltip>
        );
    }

    return (
        <Tooltip title="Delete Trainer Request">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Trainer Request"
                onClick={handleClick}
            />
        </Tooltip>
    );
}