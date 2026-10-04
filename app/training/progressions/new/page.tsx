import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import TrainingProgressionForm from "@/components/TrainingProgression/TrainingProgressionForm";
import prisma from "@/lib/db";
import {authOptions} from "@/auth/auth";
import {getServerSession} from "next-auth";
import {Info} from "@mui/icons-material";

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes("STAFF")) {
        return (
            <Card>
                <CardContent>
                    <Stack direction="row" spacing={1} sx={{
                        alignItems: "center"
                    }}>
                        <Info color="error"/>
                        <Typography>You do not have access to this page.</Typography>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    const allProgressions = await prisma.trainingProgression.findMany({
        orderBy: {
            name: 'asc',
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New Training Progression</Typography>
                <TrainingProgressionForm allProgressions={allProgressions}/>
            </CardContent>
        </Card>
    );
}