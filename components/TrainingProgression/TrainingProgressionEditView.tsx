'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import TrainingProgressionForm from "@/components/TrainingProgression/TrainingProgressionForm";
import {ArrowBack} from "@mui/icons-material";
import Link from "next/link";
import {useTrainingProgressions} from "@/lib/osmium/hooks/training";

export default function TrainingProgressionEditView({progressionId}: { progressionId: string }) {

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
                <Stack direction="row" spacing={2} alignItems="center">
                    <Link href="/training/progressions" style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5" gutterBottom>Edit Training Progression</Typography>
                </Stack>
                <TrainingProgressionForm trainingProgression={trainingProgression}/>
            </CardContent>
        </Card>
    );
}
