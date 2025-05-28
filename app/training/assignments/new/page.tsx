import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import TrainingAssignmentForm from "@/components/TrainingAssignment/TrainingAssignmentForm";
import prisma from "@/lib/db";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import {permanentRedirect} from "next/navigation";

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session || (!session.user.staffPositions.includes("TA") && !session.user.staffPositions.includes("ATA"))) {
        permanentRedirect('/training/assignments');
    }

    const allUsers = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: 'NONE',
            },
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>New Training Assignment</Typography>
                <TrainingAssignmentForm allUsers={allUsers as User[]}/>
            </CardContent>
        </Card>
    );
}