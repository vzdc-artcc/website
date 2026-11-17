'use client';
import React from 'react';
import {Card, CardContent, Grid, Skeleton, Typography} from "@mui/material";
import ProgressionCompleteButton from "@/components/Profile/ProgressionCompleteButton";
import {useMe} from "@/lib/osmium/hooks/me";
import {useUserProgression} from "@/lib/osmium/hooks/training";
import ProgressionSteps from "@/components/Progression/ProgressionSteps";

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
                    <ProgressionSteps steps={steps} sessionHref={(id) => `/profile/training/${id}`}/>
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
