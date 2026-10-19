import React from 'react';
import {Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import TrainingProgressionForm from "@/components/TrainingProgression/TrainingProgressionForm";
import {ArrowBack} from "@mui/icons-material";
import Link from "next/link";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    const trainingProgression = await prisma.trainingProgression.findUnique({
        where: {
            id,
        }
    });

    const allProgressions = await prisma.trainingProgression.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    if (!trainingProgression) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} sx={{
                    alignItems: "center"
                }}>
                    <Link href="/training/progressions" style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5" gutterBottom>Edit Training Progression</Typography>
                </Stack>
                <TrainingProgressionForm allProgressions={allProgressions} trainingProgression={trainingProgression}/>
            </CardContent>
        </Card>
    );
}