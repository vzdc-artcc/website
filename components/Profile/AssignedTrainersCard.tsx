'use client';
import React, {useMemo} from 'react';
import {Box, Card, CardActions, CardContent, Chip, CircularProgress, Stack, Typography} from "@mui/material";
import AssignedTrainerRequestButton from "@/components/Profile/AssignedTrainerRequestButton";
import AssignedTrainerRequestCancelButton from "@/components/Profile/AssignedTrainerRequestCancelButton";
import AssignedTrainerReleaseButton from "@/components/Profile/AssignedTrainerReleaseButton";
import AssignedTrainerReleaseCancelButton from "@/components/Profile/AssignedTrainerReleaseCancelButton";
import {useMe} from "@/lib/osmium/hooks/me";
import {
    useTrainerReleaseRequests,
    useTrainingAssignmentRequests,
    useTrainingAssignments,
} from "@/lib/osmium/hooks/training";

export default function AssignedTrainersCard({controllerStatus, disableRequest, disableRelease}: {
    controllerStatus?: string,
    disableRequest?: boolean,
    disableRelease?: boolean,
}) {

    const {data: me, isLoading: meLoading} = useMe();
    const {data: assignmentsData, isLoading: assignmentsLoading} = useTrainingAssignments();
    const {data: releasesData, isLoading: releasesLoading} = useTrainerReleaseRequests();
    const {data: requestsData, isLoading: requestsLoading} = useTrainingAssignmentRequests();

    const myId = me?.id;

    const trainingAssignment = useMemo(() => {
        if (!myId) return undefined;
        return (assignmentsData?.items ?? []).find((a) => a.student_id === myId);
    }, [assignmentsData, myId]);

    const release = useMemo(() => {
        if (!myId) return undefined;
        return (releasesData?.items ?? []).find((r) => r.student_id === myId);
    }, [releasesData, myId]);

    const filteredRequests = useMemo(() => {
        const requests = (requestsData?.items ?? []).slice()
            .sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
        return controllerStatus ? requests.filter((r) => r.student_controller_status === controllerStatus) : requests;
    }, [requestsData, controllerStatus]);

    const trainingAssignmentRequest = useMemo(() => {
        if (!myId) return undefined;
        return (requestsData?.items ?? []).find((r) => r.student_id === myId);
    }, [requestsData, myId]);

    const positionInQueue = filteredRequests.findIndex((r) => r.student_id === myId) + 1;

    let estimatedWaitTime = positionInQueue > 3 && trainingAssignmentRequest
        ? `${Math.max(1, Math.ceil(differenceDays(new Date(trainingAssignmentRequest.submitted_at), new Date(filteredRequests[2].submitted_at)) / 30))} months`
        : `Less than 1 month`;

    if (controllerStatus === 'VISITOR') {
        estimatedWaitTime = 'N/A for Visiting Controllers';
    }

    if (meLoading || assignmentsLoading || releasesLoading || requestsLoading) {
        return <CircularProgress/>;
    }

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography variant="h6" gutterBottom>Assigned Trainers</Typography>
                {!trainingAssignment && trainingAssignmentRequest &&
                    <>
                        <Chip color="warning" label="REQUEST PENDING"/>
                        <Typography sx={{mt: 1,}} gutterBottom>Position: <b>{positionInQueue}</b></Typography>
                        <Typography gutterBottom>Estimated Wait Time: <b>{estimatedWaitTime}</b></Typography>
                        {controllerStatus === 'HOME' &&
                            <Typography sx={{display: 'block'}} variant="caption" gutterBottom><b>Training wait time
                                estimates
                                may not be fully accurate.</b> Estimates are calculated based on your position in
                                the {controllerStatus} training queue and those at the front of the
                                queue.</Typography>}
                        {controllerStatus === 'VISITOR' &&
                            <Typography sx={{display: 'block'}} variant="caption" gutterBottom><b>Visiting controllers
                                should
                                expect much longer wait times for training.</b> Home controllers are prioritized in the
                                training assignment queue over visitors. Message the Training Administrator if you have
                                any questions about visitor training assignments.</Typography>}
                        <Typography sx={{mb: 2, display: 'block'}} variant="caption">You are strongly encouraged to look
                            for impromptu training sessions that can be posted by a member of the training team.
                            More information is available in the Training Order.</Typography>
                        <AssignedTrainerRequestCancelButton requestId={trainingAssignmentRequest.id}/>
                    </>
                }
                {!trainingAssignment && !trainingAssignmentRequest &&
                    <Typography variant="body1">You do not have any assigned trainers.</Typography>}
                {trainingAssignment && (
                    <Stack direction="column" spacing={1}>
                        <Box>
                            <Typography variant="subtitle2">Primary Trainer</Typography>
                            <Typography variant="body2">{trainingAssignment.primary_trainer_name}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2">Other Trainers</Typography>
                            {trainingAssignment.other_trainers.length === 0 &&
                                <Typography variant="body2">None</Typography>}
                            {trainingAssignment.other_trainers.map(trainer => (
                                <Typography key={trainer.id} variant="body2">{trainer.name}</Typography>
                            ))}
                        </Box>
                    </Stack>
                )}
            </CardContent>
            <CardActions>
                {!trainingAssignment && !trainingAssignmentRequest && !disableRequest &&
                    <AssignedTrainerRequestButton/>
                }
                {trainingAssignment && !release && !disableRelease &&
                    <AssignedTrainerReleaseButton/>
                }
                {trainingAssignment && release && <AssignedTrainerReleaseCancelButton releaseId={release.id}/>}
            </CardActions>

        </Card>
    );
}

const differenceDays = (date1: Date, date2: Date) => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
