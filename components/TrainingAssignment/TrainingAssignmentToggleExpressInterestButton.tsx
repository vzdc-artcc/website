'use client';
import React, {useState} from 'react';
import {TrainingAssignmentRequest} from "@/generated/prisma/browser";
import {Button} from "@mui/material";
import {expressInterest, removeInterest} from "@/actions/trainingAssignment";
import {User} from "next-auth";
import {toast} from "react-toastify";

export default function TrainingAssignmentToggleExpressInterestButton({user, request, hasAlreadyExpressedInterest,}: {
    user: User,
    request: TrainingAssignmentRequest,
    hasAlreadyExpressedInterest?: boolean,
}) {

    const [loading, setLoading] = useState(false);

    const handleToggleExpressInterest = async () => {
        setLoading(true);
        if (hasAlreadyExpressedInterest) {
            await removeInterest(request.id, user.id);
            toast('Expression of interest removed successfully!', {type: 'success'});
        } else {
            await expressInterest(request.id, user.id);
            toast('Expression of interest saved successfully!', {type: 'success'});
        }
        setLoading(false);
    }

    return (
        <Button variant="contained" size="small" disabled={loading}
                onClick={handleToggleExpressInterest}>{hasAlreadyExpressedInterest ? 'Remove Expression of Interest' : 'Express Interest'}</Button>
    );

}