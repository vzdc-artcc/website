'use client';
import React, {useEffect} from 'react';
import {OnboardingStepProps} from "@/components/Onboarding/Onboarding";
import {fetchWelcomeMessages} from "@/actions/welcome-messages";
import {Box, Button, CircularProgress, Typography} from "@mui/material";
import Markdown from "react-markdown";
import {ArrowForward} from "@mui/icons-material";

export default function OnboardingStart({user, moveNext,}: OnboardingStepProps) {

    const [welcomeMessage, setWelcomeMessage] = React.useState<string | null>(null);

    useEffect(() => {
        fetchWelcomeMessages().then((messages) => {
            if (messages) {
                if (user.controllerStatus === 'HOME') {
                    setWelcomeMessage(messages.homeText);
                } else if (user.controllerStatus === 'VISITOR') {
                    setWelcomeMessage(messages.visitorText);
                } else {
                    setWelcomeMessage(null);
                }
            } else {
                setWelcomeMessage("No welcome message; please inform the web team.  You may continue to the next step.");
            }
        });
    }, []);

    if (!welcomeMessage) {
        return <CircularProgress/>
    }

    return (
        <>
            <Box sx={{width: '100%',}}>
                <Typography variant="h5">Hi {user.firstName},</Typography>
                <Markdown>{welcomeMessage}</Markdown>
            </Box>
            <Box>
                <Button variant="contained" onClick={moveNext} endIcon={<ArrowForward/>}>Get Started</Button>
            </Box>
        </>
    );
}