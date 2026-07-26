'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, Stack, Typography} from "@mui/material";
import TrainingAssignmentForm from "@/components/TrainingAssignment/TrainingAssignmentForm";
import TrainingAssignmentDeleteButton from "@/components/TrainingAssignment/TrainingAssignmentDeleteButton";
import {useTrainingAssignment} from "@/lib/osmium/hooks/training";
import {useHasStaffPosition} from "@/lib/osmium/hooks/staff-positions";

export default function TrainingAssignmentDetailView({assignmentId}: {
    assignmentId: string,
}) {

    const {has: allowedEdit} = useHasStaffPosition(['TA', 'ATA', 'WM']);

    const {data: assignment, isLoading} = useTrainingAssignment(assignmentId);

    if (isLoading) {
        return <CircularProgress/>;
    }

    if (!assignment) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Training assignment not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <Typography variant="h5">Training Assignment</Typography>
                    {allowedEdit && <TrainingAssignmentDeleteButton assignment={assignment} noTable/>}
                </Stack>
                <Typography variant="subtitle2"
                            sx={{mb: 2,}}>{assignment.student_name} ({assignment.student_cid})</Typography>
                <TrainingAssignmentForm assignment={assignment} disabled={!allowedEdit}/>
            </CardContent>
        </Card>
    );
}
