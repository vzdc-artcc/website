'use client';
import React from 'react';
import {Done} from "@mui/icons-material";
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {useForceCompleteProgression} from "@/lib/osmium/hooks/training";

export default function ProgressionCompleteButton({cid}: { cid: number }) {

    const complete = useForceCompleteProgression(cid);

    const handleClick = () => {
        complete.mutate(undefined, {
            onSuccess: () => toast('Progression completed!', {type: 'success'}),
            onError: () => toast('Could not complete progression.', {type: 'error'}),
        });
    }

    return (
        <Button variant="contained" size="large" color="success" startIcon={<Done/>} loading={complete.isPending}
                onClick={handleClick}>Complete Progression</Button>
    );
}
