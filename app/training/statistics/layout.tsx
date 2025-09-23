import React from 'react';
import {Card, CardContent, Container, Grid2, Stack, Typography} from "@mui/material";
import {Metadata} from "next";
import prisma from "@/lib/db";
import {User} from "next-auth";
import TrainingStatsTimeSelector from "@/components/TrainingStatistics/TrainingStatsTimeSelector";
import {getAllTrainingHours} from "@/actions/trainingStats";

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

    const totalHours = await getAllTrainingHours()

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
                                <Typography variant="h6">{totalHours.toFixed(2)} hours</Typography>
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