'use client';
import React, {useState} from 'react';
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {useCreateTrainerReleaseRequest} from "@/lib/osmium/hooks/training";

export default function AssignedTrainerReleaseButton() {

    const [loading, setLoading] = useState(false);
    const createRelease = useCreateTrainerReleaseRequest();

    const submit = async () => {
        setLoading(true);
        try {
            await createRelease.mutateAsync(undefined);
            toast('Your training release request has been created.', {type: 'success',});
        } catch {
            toast('Failed to create release request.', {type: 'error',});
        }
        setLoading(false);
    }

    return (
        <Button variant="text" size="small" onClick={submit} disabled={loading} color="error">Request to Release All
            Trainers</Button>
    );
}
