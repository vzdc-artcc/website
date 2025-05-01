'use client';
import React, {useState} from 'react';
import {Lesson, TrainingAppointment} from "@prisma/client";
import {User} from "next-auth";
import {Visibility} from "@mui/icons-material";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {formatZuluDate} from "@/lib/date";

type TrainingAppointmentWithAll = TrainingAppointment & {
    student: User,
    trainer: User,
    lessons: Lesson[],
}

export default function TrainingAppointmentInformationDialog({trainingAppointment, manualOpen, onClose}: {
    trainingAppointment: TrainingAppointmentWithAll,
    manualOpen?: boolean,
    onClose?: () => void,
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
                    <DialogContentText>Start: {formatZuluDate(trainingAppointment.start)}</DialogContentText>
                    <DialogContentText>Duration: {trainingAppointment.lessons.map((l) => l.duration).reduce((acc, c) => acc + c, 0)} minutes</DialogContentText>
                    <DialogContentText>Estimated
                        End: {formatZuluDate(new Date(trainingAppointment.start.getTime() + trainingAppointment.lessons.map(l => l.duration).reduce((a, b) => a + b, 0) * 60000))}</DialogContentText>
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
                    <Button color="inherit" onClick={() => close()}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}