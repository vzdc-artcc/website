import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {
    Card,
    CardContent,
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
import {TrainingProgressionStepWithLesson} from "@/components/TrainingProgressionStep/TrainingProgressionStepForm";
import Link from "next/link";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    const trainingProgression = await prisma.trainingProgression.findUnique({
        where: {
            id,
        },
        include: {
            steps: {
                include: {
                    lesson: true,
                },
                orderBy: {
                    order: 'asc',
                },
            },
        },
    });

    if (!trainingProgression) {
        notFound();
    }

    const endStep = getLastRequiredStep(trainingProgression.steps);

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} sx={{
                    alignItems: "center"
                }}>
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
                    {trainingProgression.steps.map((step) => (
                        <ListItem key={step.id}>
                            <ListItemIcon>
                                {step.id === endStep?.id ? <Done/> : (step.optional ? <Circle/> : <ArrowDownward/>)}
                            </ListItemIcon>
                            <ListItemText primary={`${step.lesson.identifier} - ${step.lesson.name}`}/>
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}

const getLastRequiredStep = (steps: TrainingProgressionStepWithLesson[]) => {
    return steps.reduce((lastRequiredStep: TrainingProgressionStepWithLesson | null, step) => {
        if (!step.optional) {
            return step;
        }
        return lastRequiredStep;
    }, null);
}