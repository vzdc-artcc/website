'use client';
import React, {useState} from 'react';
import {TrainerReleaseRequest} from "@/generated/prisma/browser";
import {Button} from "@mui/material";
import {cancelReleaseRequest} from "@/actions/trainingAssignmentRelease";
import {toast} from "react-toastify";

export default function AssignedTrainerReleaseCancelButton({release}: { release: TrainerReleaseRequest, }) {

    const [loading, setLoading] = useState(false);

    const submit = async () => {
        setLoading(true);
        await cancelReleaseRequest(release.id);
        toast('Release request cancelled.', {type: 'success',});
        setLoading(false);
    }

    return (
        <Button variant="outlined" size="large" color="error" disabled={loading} onClick={submit}>Cancel Release
            Request</Button>
    );
}