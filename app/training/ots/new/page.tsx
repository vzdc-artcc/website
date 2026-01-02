import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import OtsRecommendationForm from "@/components/OtsRecommendation/OtsRecommendationForm";
import prisma from "@/lib/db";
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
        }
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>New OTS Recommendation</Typography>
                <OtsRecommendationForm allStudents={users as User[]}/>
            </CardContent>
        </Card>
    );

}