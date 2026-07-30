'use client';
import React, {useState} from 'react';
import {Visibility} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {formatTimezoneDate} from "@/lib/date";
import TrainingAppointmentDeleteButton from "@/components/TrainingAppointment/TrainingAppointmentDeleteButton";

interface AppointmentLike {
    id: string;
    student_name: string;
    trainer_name: string;
    start: string;
    environment?: string | null;
    double_booking: boolean;
    preparation_completed: boolean;
    lessons: { id: string, identifier: string, name: string, duration: number }[];
    additional_trainers: { trainer_id: string, trainer_name: string }[];
    estimated_duration_minutes?: number | null;
    estimated_end?: string | null;
}

export default function TrainingAppointmentInformationDialog({
                                                                 trainingAppointment,
                                                                 manualOpen,
                                                                 onClose,
                                                                 isTrainingStaff,
                                                                 timeZone,
                                                             }: {
    trainingAppointment: AppointmentLike,
    manualOpen?: boolean,
    onClose?: () => void,
    isTrainingStaff: boolean,
    timeZone: string,
}) {

    const [open, setOpen] = useState(manualOpen || false);

    const close = () => {
        setOpen(false);
        if (onClose) {
            onClose();
        }
    }

    return (
        <>
            {!manualOpen && <GridActionsCellItem
                key={trainingAppointment.id}
                icon={<Visibility/>}
                label="View Appointment"
                onClick={() => setOpen(true)}
            />}
            <Dialog open={open} onClose={() => close()} fullWidth maxWidth="sm">
                <DialogTitle>Training Appointment</DialogTitle>
                <DialogContent>
                    <DialogContentText>Trainer: {trainingAppointment.trainer_name}</DialogContentText>
                    <DialogContentText>Additional
                        Trainer(s): {trainingAppointment.additional_trainers.length > 0 ? trainingAppointment.additional_trainers.map((at) => at.trainer_name).join(', ') : 'N/A'}</DialogContentText>
                    <DialogContentText>Student: {trainingAppointment.student_name}</DialogContentText>
                    <br/>
                    <DialogContentText
                        color={trainingAppointment.double_booking ? 'error' : 'textSecondary'}>Environment: {trainingAppointment.double_booking ? 'DOUBLE BOOKED' : trainingAppointment.environment || 'PENDING ASSIGNMENT'}</DialogContentText>
                    <br/>
                    <DialogContentText>Start: {formatTimezoneDate(new Date(trainingAppointment.start), timeZone)}</DialogContentText>
                    <DialogContentText>Duration: {trainingAppointment.estimated_duration_minutes ?? 0} minutes</DialogContentText>
                    {trainingAppointment.estimated_end && <DialogContentText>Estimated
                        End: {formatTimezoneDate(new Date(trainingAppointment.estimated_end), timeZone)}</DialogContentText>}
                    <br/>
                    <DialogContentText>Preparation
                        Complete: {trainingAppointment.preparation_completed ? 'YES' : 'NO'}</DialogContentText>
                    <br/>
                    <DialogContentText>Lessons:</DialogContentText>
                    {trainingAppointment.lessons.map((lesson) => (
                        <DialogContentText key={lesson.id}>
                            {lesson.identifier} - {lesson.name}
                        </DialogContentText>
                    ))}
                </DialogContent>
                <DialogActions>
                    {isTrainingStaff &&
                        <TrainingAppointmentDeleteButton trainingAppointment={trainingAppointment} fromAdmin
                                                         onDelete={close}/>
                    }
                    <Button variant="contained" size="small" onClick={() => close()}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
