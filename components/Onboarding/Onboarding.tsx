'use client';
import React, {useEffect, useState} from 'react';
import {User} from "next-auth";
import {Box, CircularProgress, Container, Dialog, DialogContent, Paper, Stack,} from "@mui/material";
import Logo from "@/components/Logo/Logo";
import {completeOnboarding, fetchOnboardingState, updateOnboardingStep} from "@/actions/onboarding";
import BackgroundImage from "@/components/Hero/BackgroundImage";
import dynamic from "next/dynamic";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export type OnboardingStepProps = {
    user: User,
    moveNext: () => void,
    moveBack: () => void,
}

const OnboardingStart = dynamic(() => import('./OnboardingStart'));
const OnboardingCheckUserInfo = dynamic(() => import('./OnboardingCheckUserInfo'));
const OnboardingGoap = dynamic(() => import('./OnboardingGoap'));
const OnboardingTrainingOrder = dynamic(() => import('./OnboardingTrainingOrder'));
const OnboardingCheckRosterInfo = dynamic(() => import('./OnboardingCheckRosterInfo'));
const OnboardingProfile = dynamic(() => import('./OnboardingProfile'));
const OnboardingTraining = dynamic(() => import('./OnboardingTraining'));
const OnboardingFinalNotes = dynamic(() => import('./OnboardingFinalNotes'));

const totalSteps = 8;

const getOnboardingComponent = (step: number, user: User, moveNext: () => void, moveBack: () => void): React.ReactNode | null => {

    const params = {user, moveNext, moveBack};

    const steps = [
        <OnboardingStart {...params} />,
        <OnboardingGoap {...params} />,
        <OnboardingTrainingOrder {...params} />,
        <OnboardingCheckUserInfo {...params} />,
        <OnboardingCheckRosterInfo {...params} />,
        <OnboardingProfile {...params} />,
        <OnboardingTraining {...params} />,
        <OnboardingFinalNotes {...params} />,
    ]

    if (step >= 0 && step < steps.length) {
        return steps[step];
    } else {
        if (step >= steps.length) {
            return steps[steps.length - 1];
        }
        return null;
    }
}

export default function Onboarding({user,}: {
    user: User,
}) {

    const [open, setOpen] = useState(user.showWelcomeMessage);
    const [onboardingState, setOnboardingState] = useState<number>(-1);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            fetchOnboardingState(user.id).then((step) => {
                setOnboardingState(step);
            }).catch((error) => {
                console.error('Error fetching onboarding state:', error);
                setError('Failed to fetch onboarding state. Please try again later or contact the web team.');
            });
        }

    }, [open]);

    const moveNext = () => {
        if (onboardingState + 1 >= totalSteps) {
            completeOnboarding(user.id).then(() => {
                router.push('/profile/overview');
                toast.success('Onboarding complete! Welcome to the facility!');
                setOpen(false);
            });
            return;
        }

        updateOnboardingStep(user.id, onboardingState + 1).then((s) => {
            setOnboardingState(s);
        }).catch((error) => {
            console.error('Error updating onboarding step:', error);
            setError('Failed to update onboarding step. Please try again later or contact the web team.');
        });
    }

    const moveBack = () => {
        updateOnboardingStep(user.id, onboardingState - 1).then((s) => {
            setOnboardingState(s);
        }).catch((error) => {
            console.error('Error updating onboarding step:', error);
            setError('Failed to update onboarding step. Please try again later or contact the web team.');
        });
    }

    return (
        <Dialog open={open} fullScreen>
            <DialogContent sx={{
                py: {xs: 2, md: 4},
                px: 0,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <Box>
                    <BackgroundImage/>
                </Box>
                <Container maxWidth="md" sx={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}>
                    <Stack component={Paper} direction="column" sx={{
                        p: 2,
                        overflowY: 'auto',
                        maxHeight: '100%',
                    }} spacing={2}>
                        <Box>
                            <Logo/>
                        </Box>
                        {!error && onboardingState < 0 && <CircularProgress/>}
                        {error && <Box sx={{color: 'error.main'}}>{error}</Box>}
                        <Stack direction="column" spacing={4} sx={{alignItems: 'flex-end',}}>
                            {onboardingState >= 0 && getOnboardingComponent(onboardingState, user, moveNext, moveBack)}
                        </Stack>
                    </Stack>
                </Container>
            </DialogContent>
        </Dialog>
    )
}