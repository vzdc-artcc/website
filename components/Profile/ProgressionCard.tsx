import React from 'react';
import {User} from "next-auth";
import {Card, CardContent, Chip, Grid2, Stack, Typography} from "@mui/material";
import {getProgressionStatus} from "@/actions/progressionAssignment";
import {East, South} from "@mui/icons-material";
import {formatZuluDate} from "@/lib/date";
import Link from "next/link";
import ProgressionCompleteButton from "@/components/Profile/ProgressionCompleteButton";

export default async function ProgressionCard({user}: { user: User }) {

    const status = await getProgressionStatus(user.id);

    const allRequiredCompleted = status.filter(step => !step.step.optional && !step.passed).length === 0;

    if (status.length === 0) {
        return (
            <Card sx={{height: '100%',}}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Training Progression</Typography>
                    <Typography>There are no training progressions assigned to you at this
                        time. </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography
                    variant="h6">{status[0]?.progression ? `Progression - ${status[0].progression.name}` : 'Training Progression'}</Typography>
                <Typography gutterBottom>Click on a lesson to view the ticket submitted for it.</Typography>
                <Grid2 container columns={11} spacing={1}>
                    {status.map((step, i) => (
                        <>
                            {i !== 0 &&
                                <Grid2 size={{
                                    xs: 11,
                                    md: 1,
                                }} key={`progression-arrow-${i}`}>
                                    <Stack direction="column" justifyContent="center" alignItems="center"
                                           sx={{height: '100%',}}>
                                        <East fontSize="large" sx={{display: {xs: 'none', md: 'inherit',}}}/>
                                        <South fontSize="large" sx={{display: {md: 'none',}}}/>
                                    </Stack>
                                </Grid2>
                            }
                            <Grid2 size={{
                                xs: 11,
                                md: 4,
                                lg: 2,
                            }} key={step.step.id}>
                                <Card variant="outlined" sx={{height: '100%',}}>
                                    <CardContent>
                                        {step.step.optional ?
                                            <Typography variant="subtitle2" gutterBottom>OPTIONAL</Typography> :
                                            <Typography variant="subtitle2" gutterBottom>REQUIRED</Typography>}
                                        <Link
                                            href={step.trainingSession ? `/profile/training/${step.trainingSession.id}` : ''}>
                                            <Chip
                                                label={step.lesson.identifier}
                                                size="medium"
                                                color={step.passed ? 'success' : step.trainingTicket ? 'error' : 'default'}
                                            />
                                        </Link>
                                        <Typography variant="subtitle1" gutterBottom>{step.lesson.name}</Typography>
                                        {step.trainingSession ? <Typography
                                                variant="subtitle2">Attempted {formatZuluDate(step.trainingSession.start)}</Typography> :
                                            <Typography variant="subtitle2">Never Attempted</Typography>}
                                    </CardContent>
                                </Card>

                            </Grid2>
                        </>
                    ))}
                    {!user.noForceProgressionFinish && allRequiredCompleted && <Grid2 size={11} sx={{mt: 2,}}>
                        <ProgressionCompleteButton user={user} progression={status[0].progression}/>
                        <Typography variant="subtitle2" sx={{mt: 1,}}>Even though you meet all the requirements to
                            complete this progression, we strongly encourage you to complete all of the optional steps
                            to reinforce your understanding. The next progression (if applicable) will automatically be
                            assigned.</Typography>
                        <Typography color="red">You will NOT be able to return to this progression unless it is
                            reassigned.</Typography>
                    </Grid2>}
                </Grid2>
            </CardContent>
        </Card>
    );
}