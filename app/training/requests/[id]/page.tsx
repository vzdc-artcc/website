import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Card, CardActions, CardContent, Stack, Typography} from "@mui/material";
import {formatZuluDate} from "@/lib/date";
import TrainerAssignmentRequestDeleteButton
    from "@/components/TrainerAssignmentRequest/TrainerAssignmentRequestDeleteButton";
import TrainingAssignmentForm from "@/components/TrainingAssignment/TrainingAssignmentForm";
import {getRating} from "@/lib/vatsim";
import TrainingAssignmentToggleExpressInterestButton
    from "@/components/TrainingAssignment/TrainingAssignmentToggleExpressInterestButton";

export default async function Page(props: { params: Promise<{ id: string, }> }) {
    const params = await props.params;

    const {id} = params;

    const request = await prisma.trainingAssignmentRequest.findUnique({
        where: {
            id,
        },
        include: {
            student: true,
            interestedTrainers: true,
        }
    });

    if (!request) {
        notFound();
    }

    const session = await getServerSession(authOptions);

    const isTaOrAtaOrWm = session?.user.staffPositions.includes('TA') || session?.user.staffPositions.includes('ATA') || session?.user.staffPositions.includes('WM');

    const allUsers = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: 'NONE',
            },
        },
    });

    return session && (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                        <Typography variant="h5">Training Request - {request.student.fullName}</Typography>
                        {isTaOrAtaOrWm && <TrainerAssignmentRequestDeleteButton request={request} noTable/>}
                    </Stack>
                    <Typography
                        variant="subtitle2">Student: {request.student.fullName} ({request.student.cid})</Typography>
                    <Typography variant="subtitle2">Submitted: {formatZuluDate(request.submittedAt)}</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6">Interested Trainers</Typography>
                    {request.interestedTrainers.length === 0 &&
                        <Typography>No trainers have shown interest yet.</Typography>}
                    <Stack direction="column" spacing={1}>
                        {request.interestedTrainers.map(trainer => (
                            <Typography key={trainer.id} variant="subtitle1">{trainer.fullName} ({trainer.cid})
                                - {getRating(trainer.rating)}</Typography>
                        ))}
                    </Stack>
                </CardContent>
                <CardActions>
                    <TrainingAssignmentToggleExpressInterestButton user={session.user} request={request}
                                                                   hasAlreadyExpressedInterest={request.interestedTrainers.map(it => it.id).includes(session.user.id)}/>
                </CardActions>
            </Card>
            {isTaOrAtaOrWm && <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 2,}}>Training Assignment</Typography>
                    <TrainingAssignmentForm allUsers={allUsers as User[]} trainingRequest={request}
                                            requestStudent={request.student as User}/>
                </CardContent>
            </Card>}
        </Stack>

    );
}