'use client';
import React, {useState} from 'react';
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {useDeleteTrainingAssignmentRequest} from "@/lib/osmium/hooks/training";

export default function AssignedTrainerRequestCancelButton({requestId}: { requestId: string, }) {

    const [clicked, setClicked] = useState(false);
    const deleteRequest = useDeleteTrainingAssignmentRequest();

    const submit = async () => {
        if (!clicked) {
            setClicked(true)
            toast('Are you sure you want to cancel your training request. This will remove your position in the queue. Click the button again to confirm.', {type: 'warning',});
            return;
        }

        try {
            await deleteRequest.mutateAsync(requestId);
            toast('Your training assignment request has been cancelled.', {type: 'success',});
        } catch {
            toast('Failed to cancel training assignment request.', {type: 'error',});
        }
        setClicked(false);
    }

    return (
        <Button variant={clicked ? 'contained' : 'outlined'} color="error" onClick={submit}>Cancel</Button>
    );
}
