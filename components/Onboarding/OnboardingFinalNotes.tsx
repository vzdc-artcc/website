'use client';
import React from 'react';
import {OnboardingStepProps} from "@/components/Onboarding/Onboarding";
import {Box, Button, Stack, Typography} from "@mui/material";
import {ArrowBack, Celebration} from "@mui/icons-material";

export default function OnboardingFinalNotes({moveNext, moveBack}: OnboardingStepProps) {

    return (
        <>
            <Stack direction="column" spacing={2} sx={{width: '100%',}}>
                <Typography variant="h5">Final Notes</Typography>
                <Typography>Join our Discord/TeamSpeak for the latest updates under the 'Community' tab.</Typography>
                <br/>
                <Typography>Thank you for joining the facility!</Typography>
            </Stack>
            <Box>
                <Button variant="outlined" color="inherit" startIcon={<ArrowBack/>} onClick={moveBack}
                        sx={{mr: 2,}}>Back</Button>
                <Button variant="contained" startIcon={<Celebration/>} onClick={moveNext}>Finish</Button>
            </Box>
        </>
    );
}