'use client';
import React, {useState} from 'react';
import {IconButton, Tooltip} from "@mui/material";
import {Close} from "@mui/icons-material";
import {toast} from "react-toastify";
import {useCreateTrainerReleaseRequest} from "@/lib/osmium/hooks/training";

export default function TrainerSideRequestButton({studentId}: { studentId: string }) {
    const [clicked, setClicked] = useState(false);
    const createRelease = useCreateTrainerReleaseRequest();

    const handleClick = async () => {
        if (clicked) {
            try {
                await createRelease.mutateAsync(studentId);
                toast(`Training release request submitted successfully!`, {type: 'success'});
            } catch {
                toast(`Failed to submit release request. There may already be one active.`, {type: 'error'});
            }
        } else {
            toast(`Click again to confirm request.`, {type: 'warning'});
            setClicked(true);
        }

    }

    return (
        <Tooltip title="Request to release student">
            <IconButton onClick={handleClick}>
                <Close color={clicked ? "warning" : "inherit"}/>
            </IconButton>
        </Tooltip>
    );
}
