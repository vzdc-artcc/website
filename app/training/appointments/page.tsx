import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import TrainingAppointmentTable from "@/components/TrainingAppointment/TrainingAppointmentTable";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";

export default async function Page() {

    const session = await getServerSession(authOptions);
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
        </Stack>
    );
}