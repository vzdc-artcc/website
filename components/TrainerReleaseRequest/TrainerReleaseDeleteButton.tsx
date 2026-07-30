'use client';
import React, {useState} from 'react';
import {Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {toast} from "react-toastify";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDeleteTrainerReleaseRequest} from "@/lib/osmium/hooks/training";

export default function TrainerReleaseDeleteButton({requestId}: { requestId: string }) {
    const [clicked, setClicked] = useState(false);
    const router = useRouter();
    const deleteRequest = useDeleteTrainerReleaseRequest();

    const handleClick = async () => {
        if (clicked) {
            await deleteRequest.mutateAsync(requestId);
            toast(`Training release request deleted successfully!`, {type: 'success'});
            router.replace('/training/releases');
        } else {
            toast(`Click again to confirm deletion.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Delete Trainer Release Request">
            <GridActionsCellItem
                icon={<Delete color={clicked ? "warning" : "inherit"}/>}
                label="Delete Trainer Release Request"
                onClick={handleClick}
            />
        </Tooltip>
    );
}
