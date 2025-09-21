import React from 'react';
import {Card, CardContent, Container, Grid2, Stack, Typography} from "@mui/material";
import {Metadata} from "next";
import prisma from "@/lib/db";
import {User} from "next-auth";
import TrainingStatsTimeSelector from "@/components/TrainingStatistics/TrainingStatsTimeSelector";

export const metadata: Metadata = {
    title: 'Training Statistics | vZDC',
    description: 'vZDC training stats page',
};

export default async function Layout({children}: { children: React.ReactNode }) {

    const mentorsAndInstructors = await prisma.user.findMany({
        where: {
            OR: [
                {
                    roles: {
                        has: "MENTOR",
                    },
                },
                {
                    roles: {
                        has: "INSTRUCTOR",
                    },
                },
            ],
        },
    });

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const sessions = await prisma.trainingSession.findMany({
        where: {
            start: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    const totalHours = sessions.reduce((sum, session) => {
        const duration = (session.end.getTime() - session.start.getTime()) / (1000 * 60 * 60); // convert milliseconds to hours
        return sum + duration;
    }, 0).toFixed(3);

    return (
        (<Container maxWidth="lg">
            <Stack direction="column" spacing={2}>
                <Grid2 container columns={4} spacing={2}>
                    <Grid2
                        size={{
                            xs: 4,
                            sm: 2,
                            md: 3
                        }}>
                        <TrainingStatsTimeSelector trainingStaff={mentorsAndInstructors as User[]}/>
                    </Grid2>
                    <Grid2
                        size={{
                            xs: 4,
                            sm: 2,
                            md: 1
                        }}>
                        <Card>
                            <CardContent>
                                <Typography>All-Time Hours</Typography>
                                <Typography variant="h6">{totalHours} hours</Typography>
                            </CardContent>
                        </Card>
                    </Grid2>
                    <Grid2 size={4}>
                        {children}
                    </Grid2>
                </Grid2>
            </Stack>
        </Container>)
    );
}