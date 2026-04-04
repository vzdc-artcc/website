import React from 'react';
import {Card, CardContent, Container, Grid, Stack, Typography} from "@mui/material";
import {getAllTimeHours} from "@/lib/hours";
import StatisticsTimeSelector from "@/components/Statistics/StatisticsTimeSelector";
import {Metadata} from "next";
import prisma from "@/lib/db";
import {User} from "next-auth";

export const metadata: Metadata = {
    title: 'Statistics | vZDC',
    description: 'vZDC stats page',
};

export default async function Layout({children}: { children: React.ReactNode }) {

    const allTimeHours = await getAllTimeHours();
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
    });

    return (
        (<Container maxWidth="lg">
            <Stack direction="column" spacing={2}>
                <Grid container columns={4} spacing={2}>
                    <Grid
                        size={{
                            xs: 4,
                            sm: 2,
                            md: 3
                        }}>
                        <StatisticsTimeSelector controllers={controllers as User[]}/>
                    </Grid>
                    <Grid
                        size={{
                            xs: 4,
                            sm: 2,
                            md: 1
                        }}>
                        <Card>
                            <CardContent>
                                <Typography>All-Time Hours</Typography>
                                <Typography variant="h6">{allTimeHours.toFixed(3)} hours</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={4}>
                        {children}
                    </Grid>
                </Grid>
            </Stack>
        </Container>)
    );
}