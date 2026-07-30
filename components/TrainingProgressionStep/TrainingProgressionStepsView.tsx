'use client';
import React from 'react';
import {Button, Card, CardContent, CircularProgress, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import TrainingProgressionStepTable from "@/components/TrainingProgressionStep/TrainingProgressionStepTable";
import TrainingProgressionStepForm from "@/components/TrainingProgressionStep/TrainingProgressionStepForm";
import Link from "next/link";
import {ArrowBack, Reorder} from "@mui/icons-material";
import {useTrainingProgressions} from "@/lib/osmium/hooks/training";

export default function TrainingProgressionStepsView({progressionId}: { progressionId: string }) {

    const {data, isLoading} = useTrainingProgressions();

    if (isLoading) {
        return <CircularProgress/>;
    }

    const trainingProgression = data?.items.find((p) => p.id === progressionId);

    if (!trainingProgression) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Training progression not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack direction={{xs: 'column', md: 'row',}} justifyContent="space-between">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Link href={`/training/progressions/`}
                              style={{color: 'inherit',}}>
                            <Tooltip title="Go Back">
                                <IconButton color="inherit">
                                    <ArrowBack fontSize="large"/>
                                </IconButton>
                            </Tooltip>
                        </Link>
                        <Typography variant="h5" gutterBottom>{trainingProgression.name} - Progression Steps</Typography>
                    </Stack>
                    <Link href={`/training/progressions/${trainingProgression.id}/edit/steps/order`}
                          style={{color: 'inherit',}}>
                        <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                sx={{mr: 1,}}>Order</Button>
                    </Link>
                </Stack>
                <TrainingProgressionStepTable trainingProgression={trainingProgression}/>
                <Card sx={{mt: 4}} variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>New Progression Step</Typography>
                        <TrainingProgressionStepForm trainingProgression={trainingProgression}/>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}
