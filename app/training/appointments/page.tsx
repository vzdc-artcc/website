import React from 'react';
import {Card, CardContent, Stack, Typography} from "@mui/material";
import TrainingAppointmentTable from "@/components/TrainingAppointment/TrainingAppointmentTable";

export default function Page() {
    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Training Appointments</Typography>
                    <Typography gutterBottom>Only the trainer can edit their training appointments. Appointments are
                        automatically deleted one week after the calculated end time.</Typography>
                    <TrainingAppointmentTable/>
                </CardContent>
            </Card>
        </Stack>
    );
}
