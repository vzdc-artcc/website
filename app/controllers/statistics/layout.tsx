import React from 'react';
import {Card, CardContent, Container, Grid2, Stack, Typography} from "@mui/material";
import {getAllTimeHours} from "@/lib/hours";
import StatisticsTimeSelector from "@/components/Statistics/StatisticsTimeSelector";
import {Metadata} from "next";
import prisma from "@/lib/db";
import {getServerSession, User} from "next-auth";
import {authOptions} from "@/auth/auth";
import LoginButton from "@/components/Navbar/LoginButton";

export const metadata: Metadata = {
    title: 'Statistics | vZDC',
    description: 'vZDC stats page',
};

export default async function Layout({children}: { children: React.ReactNode }) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return <Card>
            <CardContent>
                <Typography variant="h5">Login Required</Typography>
                <Typography color="red" fontWeight="bold" gutterBottom>By order of the A.T.M, you must be logged in to
                    see this information.</Typography>
                <LoginButton session={session}/>
            </CardContent>
        </Card>;

    }

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
                <Grid2 container columns={4} spacing={2}>
                    <Grid2
                        size={{
                            xs: 4,
                            sm: 2,
                            md: 3
                        }}>
                        <StatisticsTimeSelector controllers={controllers as User[]}/>
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
                                <Typography variant="h6">{allTimeHours.toFixed(3)} hours</Typography>
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