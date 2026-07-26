'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import OrderList, {OrderItem} from "@/components/Order/OrderList";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";
import {
    useTrainingLessons,
    useTrainingProgressionSteps,
    useTrainingProgressions,
    useUpdateTrainingProgressionStep
} from "@/lib/osmium/hooks/training";

export default function TrainingProgressionStepOrderView({progressionId}: { progressionId: string }) {

    const {data: progressionsData, isLoading: progressionsLoading} = useTrainingProgressions();
    const {data: stepsData, isLoading: stepsLoading} = useTrainingProgressionSteps();
    const {data: lessonsData, isLoading: lessonsLoading} = useTrainingLessons();
    const updateStep = useUpdateTrainingProgressionStep();

    if (progressionsLoading || stepsLoading || lessonsLoading) {
        return <CircularProgress/>;
    }

    const progression = progressionsData?.items.find((p) => p.id === progressionId);

    if (!progression) {
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

    const handleSubmit = async (items: OrderItem[]) => {
        for (const item of items) {
            await updateStep.mutateAsync({stepId: item.id, body: {sort_order: item.order}});
        }
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Link href={`/training/progressions/${progression.id}/edit/steps`}
                          style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5" gutterBottom>{progression.name} - Step Order</Typography>
                </Stack>
                <OrderList items={steps.map((s) => {
                    const lesson = lessons.find((l) => l.id === s.lesson_id);
                    return {
                        id: s.id,
                        name: `${s.optional ? '(OPTIONAL)' : ''} ${lesson ? `${lesson.identifier} - ${lesson.name}` : 'Unknown lesson'}`,
                        order: s.sort_order,
                    };
                })} onSubmit={handleSubmit}/>
            </CardContent>
        </Card>
    );

}
