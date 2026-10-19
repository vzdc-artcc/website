import React from 'react';
import prisma from "@/lib/db";
import {Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import {notFound} from "next/navigation";
import OrderList from "@/components/Order/OrderList";
import {updateTrainingProgressionStepOrder} from "@/actions/trainingProgressionStep";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";

export default async function Page({params}: { params: Promise<{ id: string }> }) {

    const {id} = await params;

    const progression = await prisma.trainingProgression.findUnique({
        where: {
            id,
        },
    });

    if (!progression) {
        notFound();
    }

    const steps = await prisma.trainingProgressionStep.findMany({
        where: {
            progressionId: progression.id,
        },
        orderBy: {
            order: 'asc',
        },
        include: {
            lesson: true,
        },
    });

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} sx={{
                    alignItems: "center"
                }}>
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
                <OrderList items={steps.map((s) => ({
                    id: s.id,
                    name: `${s.optional ? '(OPTIONAL)' : ''} ${s.lesson.identifier} - ${s.lesson.name}`,
                    order: s.order,
                }))} onSubmit={updateTrainingProgressionStepOrder}/>
            </CardContent>
        </Card>
    );

}