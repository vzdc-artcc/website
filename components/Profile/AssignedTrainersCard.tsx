import React from 'react';
import {User} from "next-auth";
import {Box, Card, CardActions, CardContent, Chip, Stack, Typography} from "@mui/material";
import prisma from "@/lib/db";
import {getRating} from "@/lib/vatsim";
import AssignedTrainerRequestButton from "@/components/Profile/AssignedTrainerRequestButton";
import AssignedTrainerRequestCancelButton from "@/components/Profile/AssignedTrainerRequestCancelButton";
import AssignedTrainerReleaseButton from "@/components/Profile/AssignedTrainerReleaseButton";
import AssignedTrainerReleaseCancelButton from "@/components/Profile/AssignedTrainerReleaseCancelButton";

export default async function AssignedTrainersCard({user}: { user: User, }) {

    const trainingAssignment = await prisma.trainingAssignment.findUnique({
        where: {
            studentId: user.id,
        },
        include: {
            primaryTrainer: true,
            otherTrainers: true,
        },
    });

    const release = await prisma.trainerReleaseRequest.findUnique({
        where: {
            studentId: user.id,
        },
    });
    const requests = await prisma.trainingAssignmentRequest.findMany({
        orderBy: { submittedAt: 'asc' },
        include: {
            student: {
                select: {
                    id: true,
                    controllerStatus: true,
                },
            },
        },
    });

    const trainingAssignmentRequest = requests.find(request => request.studentId === user.id);

    const filterStatus = user.controllerStatus; // ensure the user's controllerStatus is available
    const filteredRequests = filterStatus
        ? requests.filter(r => r.student?.controllerStatus === filterStatus)
        : requests;

    const positionInQueue = filteredRequests.findIndex(request => request.studentId === user.id) + 1;

    let estimatedWaitTime = positionInQueue > 3 && trainingAssignmentRequest ? `${Math.max(1, Math.ceil(differenceDays(trainingAssignmentRequest.submittedAt, filteredRequests[2].submittedAt) / 30))} months` : `Less than 1 month`;

    if (user.controllerStatus === 'VISITOR') {
        estimatedWaitTime = 'N/A for Visiting Controllers';
    }

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography variant="h6">Assigned Trainers</Typography>
                <Typography variant="subtitle2" sx={{mb: 2,}} fontWeight="regular">Training assignments are made by the
                    Training Administrator.</Typography>
                {!trainingAssignment && trainingAssignmentRequest &&
                    <>
                        <Chip color="warning" label="REQUEST PENDING"/>
                        <Typography sx={{mt: 1,}} gutterBottom>Position: <b>{positionInQueue}</b></Typography>
                        <Typography gutterBottom>Estimated Wait Time: <b>{estimatedWaitTime}</b></Typography>
                        {user.controllerStatus === 'HOME' &&
                            <Typography sx={{mb: 2, display: 'block'}} variant="caption"><b>Training wait time estimates
                                may not be fully accurate.</b> Estimates are calculated based on your position in
                                the {user.controllerStatus} training queue and those at the front of the
                                queue.</Typography>}
                        {user.controllerStatus === 'VISITOR' &&
                            <Typography sx={{mb: 2, display: 'block'}} variant="caption"><b>Visiting controllers should
                                expect much longer wait times for training.</b> Home controllers are prioritized in the
                                training assignment queue over visitors. Message the Training Administrator if you have
                                any questions about visitor training assignments.</Typography>}
                        <AssignedTrainerRequestCancelButton request={trainingAssignmentRequest}/>
                    </>
                }
                {!trainingAssignment && !trainingAssignmentRequest &&
                    <Typography variant="body1">You do not have any assigned trainers.</Typography>}
                {trainingAssignment && (
                    <Stack direction="column" spacing={1}>
                        <Box>
                            <Typography variant="subtitle2">Primary Trainer</Typography>
                            <Typography
                                variant="body2">{trainingAssignment.primaryTrainer.firstName} {trainingAssignment.primaryTrainer.lastName} - {getRating(trainingAssignment.primaryTrainer.rating)}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2">Other Trainers</Typography>
                            {trainingAssignment.otherTrainers.map(trainer => (
                                <Typography key={trainer.id}
                                            variant="body2">{trainer.firstName} {trainer.lastName} - {getRating(trainer.rating)}</Typography>
                            ))}
                        </Box>
                    </Stack>
                )}
            </CardContent>
            <CardActions>
                {!trainingAssignment && !trainingAssignmentRequest && !user.noRequestTrainingAssignments &&
                    <AssignedTrainerRequestButton/>
                }
                {trainingAssignment && !release && !user.noRequestTrainerRelease &&
                    <AssignedTrainerReleaseButton/>
                }
                {trainingAssignment && release && <AssignedTrainerReleaseCancelButton release={release}/>}
            </CardActions>

        </Card>
    );
}

const differenceDays = (date1: Date, date2: Date) => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}