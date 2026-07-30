'use client';
import React, {useState} from 'react';
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {useCreateTrainingAssignmentRequest} from "@/lib/osmium/hooks/training";

export default function AssignedTrainerRequestButton() {

    const [loading, setLoading] = useState(false);
    const createRequest = useCreateTrainingAssignmentRequest();

    const submit = async () => {
        setLoading(true);
        try {
            await createRequest.mutateAsync({});
            toast('Your training assignment request has been submitted!', {type: 'success',});
        } catch {
            toast('Failed to submit training assignment request.', {type: 'error',});
        }
        setLoading(false);
    }

    return (
        <Button variant="contained" size="small" onClick={submit} disabled={loading}>Request Training
            Assignment</Button>
    );
}
