'use client';
import React, {useEffect, useState} from 'react';
import {OnboardingStepProps} from "@/components/Onboarding/Onboarding";
import {canRequestTraining} from "@/actions/trainingAssignmentRequest";
import {Box, Button, CircularProgress, Stack, Typography} from "@mui/material";
import AssignedTrainerRequestButton from "@/components/Profile/AssignedTrainerRequestButton";
import {ArrowBack, ArrowForward} from "@mui/icons-material";

export default function OnboardingTraining({user, moveNext, moveBack}: OnboardingStepProps) {

    const [hasRequest, setHasRequest] = useState<boolean | null>(null);

    useEffect(() => {
        canRequestTraining(user.id).then((result) => {
            setHasRequest(result);
        });
    }, [user]);

    if (hasRequest === null) {
        return <CircularProgress/>;
    }

    return (
        <>
            <Stack direction="column" spacing={2} sx={{width: '100%',}}>
                <Typography variant="h5">Training Assignment</Typography>
                {hasRequest === false && <Box>
                    <Typography>You do not already have a training assignment request or a training assignment, so you
                        can request one below.</Typography>
                    <Typography>Your position in the queue and an estimated wait time will appear in your
                        profile.</Typography>
                    <br/>
                    <AssignedTrainerRequestButton/>
                </Box>}
                {hasRequest === true && <Box>
                    <Typography>You already have a training assignment request or a training assignment, so you cannot
                        request another one.</Typography>
                    <Typography>The existing training assignment must be released or the training assignment request
                        must be cancelled to create another request.</Typography>
                </Box>}
            </Stack>
            <Box>
                <Button variant="outlined" color="inherit" startIcon={<ArrowBack/>} onClick={moveBack}
                        sx={{mr: 2,}}>Back</Button>
                <Button variant="contained" startIcon={<ArrowForward/>} onClick={moveNext}>Next</Button>
            </Box>
        </>
    );
}