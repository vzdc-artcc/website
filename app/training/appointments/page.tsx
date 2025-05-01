import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import TrainingAppointmentTable from "@/components/TrainingAppointment/TrainingAppointmentTable";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import TrainingAppointmentCalendar, {
    TrainingAppointmentWithAll
} from "@/components/TrainingAppointment/TrainingAppointmentCalendar";
import prisma from "@/lib/db";

export default async function Page() {

    const session = await getServerSession(authOptions);

    const appointments = await prisma.trainingAppointment.findMany({
        include: {
            student: true,
            trainer: true,
            lessons: true,
        },
    });

    return session?.user && (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Training Appointments</Typography>
                    <Typography gutterBottom>Only the trainer can edit their training appointments. Appointments are
                        automatically deleted 15 minutes after the start time.</Typography>
                    <TrainingAppointmentTable sessionUser={session.user}/>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <TrainingAppointmentCalendar appointments={appointments as TrainingAppointmentWithAll[]}/>
                </CardContent>
            </Card>
        </Stack>
    );
}