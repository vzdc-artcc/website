'use client';
import React from 'react';
import {
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import {ArrowBack, ArrowDownward, Circle, Done} from "@mui/icons-material";
import Link from "next/link";
import {useTrainingLessons, useTrainingProgressionSteps, useTrainingProgressions} from "@/lib/osmium/hooks/training";

interface StepLike {
    id: string;
    optional: boolean;
    sort_order: number;
    lesson_id: string;
}

export default function TrainingProgressionDetailView({progressionId}: { progressionId: string }) {

    const {data: progressionsData, isLoading: progressionsLoading} = useTrainingProgressions();
    const {data: stepsData, isLoading: stepsLoading} = useTrainingProgressionSteps();
    const {data: lessonsData, isLoading: lessonsLoading} = useTrainingLessons();

    if (progressionsLoading || stepsLoading || lessonsLoading) {
        return <CircularProgress/>;
    }

    const trainingProgression = progressionsData?.items.find((p) => p.id === progressionId);

    if (!trainingProgression) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Training progression not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    const lessons = lessonsData?.items ?? [];
    const steps = (stepsData?.items ?? [])
        .filter((s) => s.progression_id === progressionId)
        .sort((a, b) => a.sort_order - b.sort_order);

    const endStep = getLastRequiredStep(steps);

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Link href={`/training/progressions/`}
                          style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5" gutterBottom>{trainingProgression.name}</Typography>
                </Stack>
                <List>
                    {steps.map((step) => {
                        const lesson = lessons.find((l) => l.id === step.lesson_id);
                        return (
                            <ListItem key={step.id}>
                                <ListItemIcon>
                                    {step.id === endStep?.id ? <Done/> : (step.optional ? <Circle/> : <ArrowDownward/>)}
                                </ListItemIcon>
                                <ListItemText primary={lesson ? `${lesson.identifier} - ${lesson.name}` : 'Unknown lesson'}/>
                            </ListItem>
                        );
                    })}
                </List>
            </CardContent>
        </Card>
    );
}

const getLastRequiredStep = (steps: StepLike[]) => {
    return steps.reduce((lastRequiredStep: StepLike | null, step) => {
        if (!step.optional) {
            return step;
        }
        return lastRequiredStep;
    }, null);
}
