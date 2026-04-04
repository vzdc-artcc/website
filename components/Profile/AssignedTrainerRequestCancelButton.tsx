'use client';
import React, {useState} from 'react';
import {TrainingAssignmentRequest} from "@/generated/prisma/browser";
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {cancelTrainingAssignmentRequest} from "@/actions/trainingAssignmentRequest";

export default function AssignedTrainerRequestCancelButton({request}: { request: TrainingAssignmentRequest, }) {

    const [clicked, setClicked] = useState(false);

    const submit = async () => {
        if (!clicked) {
            setClicked(true)
            toast('Are you sure you want to cancel your training request. This will remove your position in the queue. Click the button again to confirm.', {type: 'warning',});
            return;
        }

        const {errors} = await cancelTrainingAssignmentRequest(request.id);

        if (errors) {
            toast(errors.join(' '), {type: 'error',});
            setClicked(false);
            return;
        }

        toast('Your training assignment request has been cancelled.', {type: 'success',});
        setClicked(false);
    }

    return (
        <Button variant={clicked ? 'contained' : 'outlined'} color="error" onClick={submit}>Cancel</Button>
    );
}