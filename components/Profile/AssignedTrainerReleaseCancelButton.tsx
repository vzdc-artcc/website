'use client';
import React, {useState} from 'react';
import {Button} from "@mui/material";
import {useDeleteTrainerReleaseRequest} from "@/lib/osmium/hooks/training";
import {toast} from "react-toastify";

export default function AssignedTrainerReleaseCancelButton({releaseId}: { releaseId: string, }) {

    const [loading, setLoading] = useState(false);
    const deleteRelease = useDeleteTrainerReleaseRequest();

    const submit = async () => {
        setLoading(true);
        try {
            await deleteRelease.mutateAsync(releaseId);
            toast('Release request cancelled.', {type: 'success',});
        } catch {
            toast('Failed to cancel release request.', {type: 'error',});
        }
        setLoading(false);
    }

    return (
        <Button variant="outlined" size="large" color="error" disabled={loading} onClick={submit}>Cancel Release
            Request</Button>
    );
}
