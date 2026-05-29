import React from 'react';
import {Card, CardContent, Container, Typography} from "@mui/material";
import prisma from "@/lib/db";
import {getServerSession, User} from "next-auth";
import FeedbackFormWrapper from "@/components/Feedback/FeedbackFormWrapper";
import {authOptions} from "@/auth/auth";
import ErrorCard from "@/components/Error/ErrorCard";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Feedback | vZDC',
    description: 'vZDC feedback page',
};

export default async function Page() {

    const controllers = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: "NONE",
            },
            OR: [
                {
                    hiddenFromRoster: null,
                },
                {
                    hiddenFromRoster: {
                        not: true,
                    },
                },
            ],
        },
        orderBy: {
            lastName: 'asc',
        },
    });

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return <ErrorCard heading="Feedback" message="You must be logged in to submit feedback."/>
    }

    return (
        <Container maxWidth="md">
            <Card>
                <CardContent>
                    <Typography variant="h5">Feedback</Typography>
                    <FeedbackFormWrapper controllers={controllers as User[]} user={session.user}/>
                </CardContent>
            </Card>
        </Container>
    );

}