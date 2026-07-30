'use client';
import React, {useMemo} from 'react';
import {Alert, Card, CardActions, CardContent, Chip, CircularProgress, Typography} from "@mui/material";
import {formatTimezoneDate, getTimeIn} from "@/lib/date";
import SessionJoinInstructionsButton from "@/components/TrainingAppointment/SessionJoinInstructionsButton";
import CompletePreparationButton from "@/components/TrainingAppointment/CompletePreparationButton";
import {useMe} from "@/lib/osmium/hooks/me";
import {useTrainingAppointments} from "@/lib/osmium/hooks/training";

export default function UpcomingTrainingAppointmentCard({timeZone}: { timeZone: string, }) {

    const {data: me, isLoading: meLoading} = useMe();
    const {data: appointmentsData, isLoading: appointmentsLoading} = useTrainingAppointments({
        studentId: me?.id,
        sortField: 'start',
        sortOrder: 'asc',
    });

    const trainingAppointment = useMemo(() => {
        const cutoff = Date.now() - 15 * 60 * 1000;
        return (appointmentsData?.items ?? []).find((ta) => new Date(ta.start).getTime() >= cutoff);
    }, [appointmentsData]);

    if (meLoading || appointmentsLoading) {
        return <CircularProgress/>;
    }

    if (!trainingAppointment) {
        return null;
    }

    const totalMinutes = trainingAppointment.lessons.map((l) => l.duration).reduce((acc, curr) => acc + curr, 0);
    const trainerNames = [trainingAppointment.trainer_name, ...trainingAppointment.additional_trainers.map((at) => at.trainer_name)];

    return (
        <Card>
            <CardContent>
                <Typography variant="h6">Training
                    Appointment: {trainerNames.join(", ")}</Typography>
                <Typography
                    variant="subtitle2">{formatTimezoneDate(new Date(trainingAppointment.start), timeZone)}
                    - {new Date(trainingAppointment.start).getTime() < Date.now() ? 'NOW' : getTimeIn(new Date(trainingAppointment.start))}</Typography>
                <Typography variant="subtitle2" gutterBottom>{totalMinutes} minutes</Typography>
                {trainingAppointment.lessons.map((lesson) => (
                    <Chip key={lesson.id} size="small" label={lesson.identifier} sx={{mr: 1,}}/>
                ))}
                <Alert severity="info" sx={{mt: 2,}}>To reschedule this session or to cancel it,
                    contact <b>{trainingAppointment.trainer_name}</b>. Last minute changes might not be
                    honored and may result in disciplinary
                    action.</Alert>
            </CardContent>
            <CardActions>
                <SessionJoinInstructionsButton trainingAppointment={trainingAppointment}/>
                <CompletePreparationButton appointment={trainingAppointment}/>
            </CardActions>
        </Card>
    );
}
