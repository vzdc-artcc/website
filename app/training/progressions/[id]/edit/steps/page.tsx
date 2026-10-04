import React from 'react';
import {Button, Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import TrainingProgressionStepTable from "@/components/TrainingProgressionStep/TrainingProgressionStepTable";
import TrainingProgressionStepForm from "@/components/TrainingProgressionStep/TrainingProgressionStepForm";
import Link from "next/link";
import {ArrowBack, Reorder} from "@mui/icons-material";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    const trainingProgression = await prisma.trainingProgression.findUnique({
        where: {
            id,
        }
    });

    if (!trainingProgression) {
        notFound();
    }

    const allLessons = await prisma.lesson.findMany({
        orderBy: {
            identifier: 'asc',
        },
    });

    return (
        <Card>
            <CardContent>
                <Stack direction={{xs: 'column', md: 'row',}} sx={{
                    justifyContent: "space-between"
                }}>
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
                        <Typography variant="h5" gutterBottom>{trainingProgression.name} - Progression Steps</Typography>
                    </Stack>
                    <Link href={`/training/progressions/${trainingProgression.id}/edit/steps/order`}
                          style={{color: 'inherit',}}>
                        <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                sx={{mr: 1,}}>Order</Button>
                    </Link>
                </Stack>
                <TrainingProgressionStepTable trainingProgression={trainingProgression} allLessons={allLessons}/>
                <Card sx={{mt: 4}} variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>New Progression Step</Typography>
                        <TrainingProgressionStepForm allLessons={allLessons} trainingProgression={trainingProgression}/>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}