'use client';
import React, {useState} from 'react';
import {Lesson, TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {Visibility} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {formatTimezoneDate} from "@/lib/date";
import TrainingAppointmentDeleteButton from "@/components/TrainingAppointment/TrainingAppointmentDeleteButton";

type TrainingAppointmentWithAll = TrainingAppointment & {
    student: User,
    trainer: User,
    lessons: Lesson[],
}

export default function TrainingAppointmentInformationDialog({
                                                                 trainingAppointment,
                                                                 manualOpen,
                                                                 onClose,
                                                                 isTrainingStaff,
                                                                 timeZone,
                                                             }: {
    trainingAppointment: TrainingAppointmentWithAll,
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
                    <DialogContentText>Trainer: {trainingAppointment.trainer.fullName}</DialogContentText>
                    <DialogContentText>Student: {trainingAppointment.student.fullName}</DialogContentText>
                    <br/>
                    <DialogContentText
                        color={trainingAppointment.doubleBooking ? 'error' : 'textSecondary'}>Environment: {trainingAppointment.doubleBooking ? 'DOUBLE BOOKED' : trainingAppointment.environment || 'PENDING ASSIGNMENT'}</DialogContentText>
                    <br/>
                    <DialogContentText>Start: {formatTimezoneDate(trainingAppointment.start, timeZone)}</DialogContentText>
                    <DialogContentText>Duration: {trainingAppointment.lessons.map((l) => l.duration).reduce((acc, c) => acc + c, 0)} minutes</DialogContentText>
                    <DialogContentText>Estimated
                        End: {formatTimezoneDate(new Date(trainingAppointment.start.getTime() + trainingAppointment.lessons.map(l => l.duration).reduce((a, b) => a + b, 0) * 60000), timeZone)}</DialogContentText>
                    <br/>
                    <DialogContentText>Preparation
                        Complete: {trainingAppointment.preparationCompleted ? 'YES' : 'NO'}</DialogContentText>
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