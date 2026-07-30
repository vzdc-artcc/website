'use client';
import React from 'react';
import {Card, CardContent, Chip, Typography} from "@mui/material";
import {getTimeIn} from "@/lib/date";
import {useTrainingAppointments} from "@/lib/osmium/hooks/training";

export default function EnvironmentStatusCard({environments}: { environments: string[] }) {
    const {data} = useTrainingAppointments({pageSize: 200});
    const appointments = data?.items ?? [];
    const now = new Date();

    const nextAppointmentForEnvironments: { name: string, start?: Date }[] = environments.map((env) => {
        const envAppointments = appointments
            .filter((appointment) => appointment.environment === env)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        const nextAppointment = envAppointments.find((appointment) => {
            const start = new Date(appointment.start);
            const durationMs = (appointment.estimated_duration_minutes ?? 0) * 60 * 1000;
            const end = new Date(start.getTime() + durationMs);
            return start > now || end > now;
        });

        return {name: env, start: nextAppointment ? new Date(nextAppointment.start) : undefined};
    });

    return (
        <Card sx={{height: '100%',}}>
            <CardContent>
                <Typography sx={{mb: 1,}}>Environment Status</Typography>
                {nextAppointmentForEnvironments.map((env, idx) => (
                    <Typography key={idx} variant="subtitle2" gutterBottom>
                        <Chip
                            size="small"
                            label={env.name}
                        /> {env?.start && env.start <= new Date() ? 'In Use'.toUpperCase() : 'Available'} {env.start && env.start > new Date() ? getTimeIn(env.start).toLowerCase().replace('in', 'for') : ''}
                    </Typography>
                ))}
            </CardContent>
        </Card>
    );
}
