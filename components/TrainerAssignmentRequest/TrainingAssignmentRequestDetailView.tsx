'use client';
import React from 'react';
import {Card, CardActions, CardContent, CircularProgress, Stack, Typography} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import TrainerAssignmentRequestDeleteButton
    from "@/components/TrainerAssignmentRequest/TrainerAssignmentRequestDeleteButton";
import TrainingAssignmentForm from "@/components/TrainingAssignment/TrainingAssignmentForm";
import TrainingAssignmentToggleExpressInterestButton
    from "@/components/TrainingAssignment/TrainingAssignmentToggleExpressInterestButton";
import {useTrainingAssignmentRequests} from "@/lib/osmium/hooks/training";
import {useMe} from "@/lib/osmium/hooks/me";
import {useHasPermission} from "@/lib/osmium/permissions";

export default function TrainingAssignmentRequestDetailView({requestId}: {
    requestId: string,
}) {

    const {data: me} = useMe();
    const currentUserCid = me ? String(me.cid) : '';
    const {allowed: canDeleteRequest} = useHasPermission('training.assignment_requests.delete');
    // Assigning creates the assignment and then deletes the request, so it
    // needs both permissions or it fails halfway.
    const {allowed: canCreateAssignment} = useHasPermission('training.assignments.create');
    const canAssign = canCreateAssignment && canDeleteRequest;

    const {data, isLoading} = useTrainingAssignmentRequests();
    const request = data?.items.find((r) => r.id === requestId);

    if (isLoading) {
        return <CircularProgress/>;
    }

    if (!request) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Training request not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    const hasAlreadyExpressedInterest = request.interested_trainers.some((t) => String(t.cid) === currentUserCid);

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="h5">Training Request - {request.student_name}</Typography>
                        {canDeleteRequest && <TrainerAssignmentRequestDeleteButton request={request} noTable/>}
                    </Stack>
                    <Typography variant="subtitle2">Student: {request.student_name} ({request.student_cid})</Typography>
                    <Typography variant="subtitle2">Submitted: {formatZuluDate(new Date(request.submitted_at))}</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">Interested Trainers</Typography>
                    {request.interested_trainers.length === 0 &&
                        <Typography>No trainers have shown interest yet.</Typography>}
                    <Stack direction="column" spacing={1}>
                        {request.interested_trainers.map((trainer) => (
                            <Typography key={trainer.id} variant="subtitle1">{trainer.name} ({trainer.cid})</Typography>
                        ))}
                    </Stack>
                </CardContent>
                <CardActions>
                    <TrainingAssignmentToggleExpressInterestButton request={request}
                                                                    hasAlreadyExpressedInterest={hasAlreadyExpressedInterest}/>
                </CardActions>
            </Card>
            {canAssign && <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2,}}>Training Assignment</Typography>
                    <TrainingAssignmentForm trainingRequest={request}/>
                </CardContent>
            </Card>}
        </Stack>
    );
}
