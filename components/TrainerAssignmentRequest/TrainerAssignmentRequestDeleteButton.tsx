'use client';
import React, {useState} from 'react';
import {toast} from "react-toastify";
import {IconButton, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDeleteTrainingAssignmentRequest} from "@/lib/osmium/hooks/training";

export default function TrainerAssignmentRequestDeleteButton({request, noTable = false,}: {
    request: { id: string },
    noTable?: boolean,
}) {

    const [clicked, setClicked] = useState(false);
    const router = useRouter();
    const deleteRequest = useDeleteTrainingAssignmentRequest();

    const handleClick = async () => {
        if (clicked) {
            await deleteRequest.mutateAsync(request.id);
            toast(`Request deleted successfully!`, {type: 'success'});
            router.replace('/training/requests/home');
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
