'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, Typography} from "@mui/material";
import ProgressionAssignmentForm from "@/components/ProgressionAssignment/ProgressionAssignmentForm";
import {useProgressionAssignments} from "@/lib/osmium/hooks/training";

export default function ProgressionAssignmentEditView({cid}: { cid: string }) {

    const {data, isLoading} = useProgressionAssignments();

    if (isLoading) {
        return <CircularProgress/>;
    }

    const assignment = data?.items.find((a) => String(a.cid) === cid);

    if (!assignment) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">No progression assignment found for this user.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Progression Assignment
                    - {assignment.display_name} ({assignment.cid})</Typography>
                <ProgressionAssignmentForm currentAssignment={{
                    userId: assignment.user_id,
                    cid: assignment.cid!,
                    displayName: assignment.display_name ?? 'Unknown',
                    progressionId: assignment.progression_id,
                }}/>
            </CardContent>
        </Card>
    );
}
