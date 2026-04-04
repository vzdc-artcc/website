import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import ProgressionAssignmentForm from "@/components/ProgressionAssignment/ProgressionAssignmentForm";
import prisma from "@/lib/db";
import {TrainingProgression} from "@/generated/prisma/client";

export default async function Page() {

    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes("STAFF")) {
        return <Card>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Info color="error"/>
                    <Typography>You do not have access to this page.</Typography>
                </Stack>
            </CardContent>
        </Card>;
    }

    const allUsers = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: "NONE",
            },
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            cid: true,
            controllerStatus: true,
        },
        orderBy: {
            lastName: "asc",
        },
    });

    const allProgressions = await prisma.trainingProgression.findMany({
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        }
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New Progression Assignment</Typography>
                <ProgressionAssignmentForm allUsers={allUsers as User[]}
                                           allProgressions={allProgressions as TrainingProgression[]}/>
            </CardContent>
        </Card>
    );
}