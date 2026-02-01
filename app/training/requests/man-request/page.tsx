import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import prisma from "@/lib/db";
import TrainerRequestManualForm from "@/components/TrainerAssignmentRequest/TrainerRequestManualForm";
import {User} from "next-auth";

export default async function Page() {

    const users = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: 'NONE',
            },
        },
        orderBy: {
            lastName: 'asc',
        },
    })

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>Manual Trainer Request Form</Typography>
                <TrainerRequestManualForm students={users as User[]}/>
            </CardContent>
        </Card>
    );
}