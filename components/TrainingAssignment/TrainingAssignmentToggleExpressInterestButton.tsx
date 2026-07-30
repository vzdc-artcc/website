'use client';
import React, {useState} from 'react';
import {Button} from "@mui/material";
import {toast} from "react-toastify";
import {useAddAssignmentRequestInterest, useRemoveAssignmentRequestInterest} from "@/lib/osmium/hooks/training";

export default function TrainingAssignmentToggleExpressInterestButton({request, hasAlreadyExpressedInterest,}: {
    request: { id: string },
    hasAlreadyExpressedInterest?: boolean,
}) {

    const [loading, setLoading] = useState(false);
    const addInterest = useAddAssignmentRequestInterest();
    const removeInterest = useRemoveAssignmentRequestInterest();

    const handleToggleExpressInterest = async () => {
        setLoading(true);
        try {
            if (hasAlreadyExpressedInterest) {
                await removeInterest.mutateAsync(request.id);
                toast.success('Expression of interest removed successfully!');
            } else {
                await addInterest.mutateAsync(request.id);
                toast.success('Expression of interest saved successfully!');
            }
        } catch {
            toast.error('Failed to update expression of interest.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button variant="contained" size="small" disabled={loading}
                onClick={handleToggleExpressInterest}>{hasAlreadyExpressedInterest ? 'Remove Expression of Interest' : 'Express Interest'}</Button>
    );

}
