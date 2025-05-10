import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Alert, Grid2, Stack, Typography} from "@mui/material";
import TrainingMenu from "@/components/Admin/TrainingMenu";
import {Metadata} from "next";
import prisma from "@/lib/db";

export const metadata: Metadata = {
    title: 'Training | vZDC',
    description: 'vZDC training admin page',
};

export default async function Layout({children}: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.some(r => ["MENTOR", "INSTRUCTOR", "STAFF"].includes(r))) {
        return (
            <Typography variant="h5" textAlign="center">You do not have access to this page.</Typography>
        );
    }

    const numDoubleBookedAppointments = await prisma.trainingAppointment.count({
        where: {
            start: {
                gte: new Date(),
            },
            doubleBooking: true,
        },
    });

    return (
        (<Grid2 container columns={9} spacing={2}>
            <Grid2
                size={{
                    xs: 9,
                    lg: 2
                }}>
                <TrainingMenu/>
            </Grid2>
            <Grid2 size="grow">
                <Stack direction="column" spacing={2}>
                    {numDoubleBookedAppointments > 0 &&
                        <Alert severity="error" variant="outlined">There are one or more double booked training
                            appointments scheduled. Check the calendar for appointments prefixed with '(DB)' and
                            consider rescheduling.</Alert>}
                    {children}
                </Stack>
            </Grid2>
        </Grid2>)
    );
}