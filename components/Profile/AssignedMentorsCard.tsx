import React from 'react';
import {User} from "next-auth";
import {Box, Card, CardActions, CardContent, Chip, Stack, Typography} from "@mui/material";
import prisma from "@/lib/db";
import {getRating} from "@/lib/vatsim";
import AssignedTrainerRequestButton from "@/components/Profile/AssignedTrainerRequestButton";
import AssignedTrainerRequestCancelButton from "@/components/Profile/AssignedTrainerRequestCancelButton";
import AssignedTrainerReleaseButton from "@/components/Profile/AssignedTrainerReleaseButton";
import AssignedTrainerReleaseCancelButton from "@/components/Profile/AssignedTrainerReleaseCancelButton";

export default async function AssignedMentorsCard({user}: { user: User, }) {

    const trainingAssignment = await prisma.trainingAssignment.findUnique({
        where: {
            studentId: user.id,
        },
        include: {
            primaryTrainer: true,
            otherTrainers: true,
        },
    });

    const requests = await prisma.trainingAssignmentRequest.findMany({
        orderBy: {
            submittedAt: 'asc',
        },
    });

    const release = await prisma.trainerReleaseRequest.findUnique({
        where: {
            studentId: user.id,
        },
    });

    const trainingAssignmentRequest = requests.find(request => request.studentId === user.id);
    const positionInQueue = requests.findIndex(request => request.studentId === user.id) + 1;

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 1,}}>
                    <Typography variant="h6">Assigned Trainer(s)</Typography>
                </Stack>
                {!trainingAssignment && trainingAssignmentRequest &&
                    <>
                        <Chip color="warning" label="REQUEST PENDING"/>
                        <Typography sx={{my: 1,}}>Position: <b>{positionInQueue}</b></Typography>
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