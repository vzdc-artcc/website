'use client';
import React, {useEffect} from 'react';
import {OnboardingStepProps} from "@/components/Onboarding/Onboarding";
import {fetchAdminDocs} from "@/actions/files";
import {Alert, Box, Button, CircularProgress, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {ArrowBack, Check, OpenInNew} from "@mui/icons-material";

export default function OnboardingTrainingOrder({moveNext, moveBack,}: OnboardingStepProps) {

    const [adminDocs, setAdminDocs] = React.useState<{ goap?: string, trainingOrder?: string } | null>(null);

    useEffect(() => {
        fetchAdminDocs().then(setAdminDocs);
    }, []);

    return (
        <>
            <Stack direction="column" spacing={2} sx={{width: '100%',}}>
                <Typography variant="h5">Training Order</Typography>
                {!adminDocs && <CircularProgress/>}
                <Typography>The Training Order prescribes the policy and procedures for all aspects of controller
                    training,
                    certification, and endorsement.</Typography>
                {adminDocs && !adminDocs.trainingOrder &&
                    <Typography>No Training Order; contact the web team.</Typography>}
                {adminDocs && adminDocs.trainingOrder &&
                    <Link target="_blank" href={`https://utfs.io/f/${adminDocs.trainingOrder}`}
                          style={{color: 'inherit',}}><Typography>Click here to view the Training Order. <OpenInNew
                        fontSize="inherit"/></Typography></Link>}
                <Alert severity="warning">You <b>MUST</b> familiarize yourself with the Training Order prior to any
                    training with the facility. Lack of knowledge of the Training Order is not a valid excuse for
                    violating it.</Alert>
                <Typography>By pressing 'Agree' and/or continuing to be a member of the facility, you agree to all the
                    provisions in the Training Order.</Typography>
            </Stack>
            <Box>
                <Button variant="outlined" color="inherit" startIcon={<ArrowBack/>} onClick={moveBack}
                        sx={{mr: 2,}}>Back</Button>
                <Button variant="contained" startIcon={<Check/>} onClick={moveNext}>I agree to the Training
                    Order</Button>
            </Box>
        </>
    );
}