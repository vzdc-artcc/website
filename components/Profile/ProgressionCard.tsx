'use client';
import React from 'react';
import {Card, CardContent, Chip, Grid, Skeleton, Stack, Typography} from "@mui/material";
import {East, South} from "@mui/icons-material";
import {formatZuluDate} from "@/lib/date";
import Link from "next/link";
import ProgressionCompleteButton from "@/components/Profile/ProgressionCompleteButton";
import {useMe} from "@/lib/osmium/hooks/me";
import {useUserProgression} from "@/lib/osmium/hooks/training";

export default function ProgressionCard() {

    const {data: me} = useMe();
    const cid = me?.cid;
    const {data: status, isLoading} = useUserProgression(cid);

    const steps = status?.steps ?? [];
    const allRequiredCompleted = steps.filter((step) => !step.optional && !step.passed).length === 0;

    if (isLoading || !me) {
        return (
            <Card sx={{height: '100%',}}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Training Progression</Typography>
                    <Skeleton height={120}/>
                </CardContent>
            </Card>
        );
    }

    if (steps.length === 0) {
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
                    variant="h6">{status?.progression_name ? `Progression - ${status.progression_name}` : 'Training Progression'}</Typography>
                <Typography gutterBottom>Click on a lesson to view the ticket submitted for it.</Typography>
                <Grid container columns={11} spacing={1}>
                    {steps.map((step, i) => (
                        <React.Fragment key={step.step_id}>
                            {i !== 0 &&
                                <Grid size={{
                                    xs: 11,
                                    md: 1,
                                }} key={`progression-arrow-${i}`}>
                                    <Stack direction="column" justifyContent="center" alignItems="center"
                                           sx={{height: '100%',}}>
                                        <East fontSize="large" sx={{display: {xs: 'none', md: 'inherit',}}}/>
                                        <South fontSize="large" sx={{display: {md: 'none',}}}/>
                                    </Stack>
                                </Grid>
                            }
                            <Grid size={{
                                xs: 11,
                                md: 4,
                                lg: 2,
                            }}>
                                <Card variant="outlined" sx={{height: '100%',}}>
                                    <CardContent>
                                        {step.optional ?
                                            <Typography variant="subtitle2" gutterBottom>OPTIONAL</Typography> :
                                            <Typography variant="subtitle2" gutterBottom>REQUIRED</Typography>}
                                        <Link
                                            href={step.training_session_id ? `/profile/training/${step.training_session_id}` : ''}>
                                            <Chip
                                                label={step.lesson_identifier}
                                                size="medium"
                                                color={step.passed ? 'success' : step.training_session_id ? 'error' : 'default'}
                                            />
                                        </Link>
                                        <Typography variant="subtitle1" gutterBottom>{step.lesson_name}</Typography>
                                        {step.session_end ? <Typography
                                                variant="subtitle2">Attempted {formatZuluDate(new Date(step.session_end))}</Typography> :
                                            <Typography variant="subtitle2">Never Attempted</Typography>}
                                    </CardContent>
                                </Card>

                            </Grid>
                        </React.Fragment>
                    ))}
                    {!me.flags.no_force_progression_finish && allRequiredCompleted && <Grid size={11} sx={{mt: 2,}}>
                        <ProgressionCompleteButton cid={me.cid}/>
                        <Typography variant="subtitle2" sx={{mt: 1,}}>Even though you meet all the requirements to
                            complete this progression, we strongly encourage you to complete all of the optional steps
                            to reinforce your understanding. The next progression (if applicable) will automatically be
                            assigned.</Typography>
                        <Typography color="red">You will NOT be able to return to this progression unless it is
                            reassigned.</Typography>
                    </Grid>}
                </Grid>
            </CardContent>
        </Card>
    );
}
