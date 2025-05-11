'use client';
import React, {useState} from 'react';
import {User} from "next-auth";
import {IconButton, Tooltip} from "@mui/material";
import {Close} from "@mui/icons-material";
import {releaseTrainingAssignment} from "@/actions/trainingAssignmentRelease";
import {toast} from "react-toastify";

export default function TrainerSideRequestButton({student}: { student: User }) {
    const [clicked, setClicked] = useState(false);

    const handleClick = async () => {
        if (clicked) {
            const res = await releaseTrainingAssignment(student);
            if (typeof res === 'string') {
                toast(res as string, {type: 'error'});
                return;
            }
            toast(`Training release request submitted successfully!`, {type: 'success'});
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