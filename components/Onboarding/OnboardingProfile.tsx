'use client';
import React from 'react';
import {OnboardingStepProps} from "@/components/Onboarding/Onboarding";
import {Alert, Box, Button, Stack, Typography} from "@mui/material";
import ProfileEditCard from "@/components/Profile/ProfileEditCard";
import {ArrowBack, ArrowForward} from "@mui/icons-material";

export default function OnboardingProfile({user, moveNext, moveBack}: OnboardingStepProps) {

    return (
        <>
            <Stack direction="column" spacing={2} sx={{width: '100%',}}>
                <Typography variant="h5">Customize Your Profile</Typography>
                <Alert severity="warning">Ensure that your timezone is set correctly. All times not ending with a 'z'
                    are in the timezone that is selected below, which include events.</Alert>
                <ProfileEditCard user={user} sessionUser={user}/>
                <Alert severity="info">Ensure you press <b>'Save'</b> above before continuing.</Alert>
                <Typography>You can access this form at any time by pressing the edit pencil in the top right of 'Your
                    Profile'.</Typography>
            </Stack>
            <Box>
                <Button variant="outlined" color="inherit" startIcon={<ArrowBack/>} onClick={moveBack}
                        sx={{mr: 2,}}>Back</Button>
                <Button variant="contained" startIcon={<ArrowForward/>} onClick={moveNext}>Next: Training</Button>
            </Box>

        </>
    );
}