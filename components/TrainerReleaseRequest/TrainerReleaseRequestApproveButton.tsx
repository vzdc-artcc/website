'use client';
import React from 'react';
import {Check} from "@mui/icons-material";
import {Tooltip} from "@mui/material";
import {toast} from "react-toastify";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {useDecideTrainerReleaseRequest} from "@/lib/osmium/hooks/training";

export default function TrainerReleaseRequestApproveButton({requestId}: { requestId: string, }) {
    const decideRequest = useDecideTrainerReleaseRequest();

    return (
        <Tooltip title="Approve Release Request">
            <GridActionsCellItem
                icon={<Check/>}
                label="Approve Release Request"
                onClick={async () => {
                    try {
                        await decideRequest.mutateAsync({requestId, status: 'APPROVED'});
                        toast.success('Release request approved successfully!');
                    } catch {
                        toast.error('Failed to approve release request.');
                    }
                }}
            />
        </Tooltip>
    );
}
