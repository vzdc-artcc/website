'use client';
import React, {useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";
import {Check, ExpandMore, LocalLibrary, Visibility} from "@mui/icons-material";
import Markdown from "react-markdown";
import {toast} from "react-toastify";
import {useTrainingLessons, useUpdateTrainingAppointment} from "@/lib/osmium/hooks/training";

interface AppointmentLike {
    id: string;
    student_id: string;
    start: string;
    preparation_completed: boolean;
    notes: string;
    environment?: string | null;
    lessons: { id: string, identifier: string, name: string }[];
    additional_trainers: { trainer_id: string, description: string }[];
}

export default function CompletePreparationButton({appointment}: { appointment: AppointmentLike }) {

    const [open, setOpen] = useState(false);
    const {data: lessonsData} = useTrainingLessons();
    const allLessons = lessonsData?.items ?? [];
    const updateAppointment = useUpdateTrainingAppointment();

    const handleCompletePreparation = async () => {
        try {
            await updateAppointment.mutateAsync({
                appointmentId: appointment.id,
                body: {
                    student_id: appointment.student_id,
                    start: appointment.start,
                    lesson_ids: appointment.lessons.map((l) => l.id),
                    notes: appointment.notes || undefined,
                    environment: appointment.environment ?? undefined,
                    additional_trainers: appointment.additional_trainers.map((at) => ({
                        trainer_id: at.trainer_id,
                        description: at.description
                    })),
                    preparation_completed: true,
                },
            });
            toast.success("Preparation completed successfully!  Your trainer has been notified.");
            setOpen(false);
        } catch {
            toast.error("Failed to complete preparation.");
        }
    }

    return (
        <>
            <Button variant="contained"
                    startIcon={appointment.preparation_completed ? <Check/> : <LocalLibrary/>}
                    disabled={appointment.preparation_completed}
                    onClick={() => setOpen(true)}>{appointment.preparation_completed ? 'Preparation Completed' : 'Complete Preparation'}</Button>
            {appointment.preparation_completed &&
                <Tooltip title="View Preparation">
                    <IconButton size="small" onClick={() => setOpen(true)}><Visibility fontSize="small"/></IconButton>
                </Tooltip>
            }
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
                <DialogTitle>Trainee Preparation</DialogTitle>
                <DialogContent>
                    <DialogContentText>Before every training session, you <b>must</b> complete any necessary preparation
                        related to the lesson or as instructed by your trainer:</DialogContentText>
                    <Box sx={{my: 2,}}>
                        {appointment.lessons.map((lesson) => {
                            const fullLesson = allLessons.find((l) => l.id === lesson.id);
                            return (
                                <Accordion key={lesson.id}>
                                    <AccordionSummary expandIcon={<ExpandMore/>}>
                                        <Typography>{lesson.identifier} - {lesson.name}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>{fullLesson?.trainee_preparation ?
                                            <Markdown>{fullLesson.trainee_preparation}</Markdown> : 'There is no trainee preparation for this lesson.'}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>
                    <DialogContentText sx={{mb: 1,}}>By selecting &apos;Complete Preparation&apos; below, you agree that
                        all
                        preparation for this session, which includes lesson preparation and trainer initiated
                        preparation, has been completed.</DialogContentText>
                    <DialogContentText sx={{mb: 1,}}>You also understand that <b>the trainer may cancel or end the
                        training session abruptly</b> if it becomes evident that the trainee has not completed the
                        preparation fully and correctly before the start time.</DialogContentText>
                    <DialogContentText sx={{mb: 1,}}>If you have any questions about the preparation, please contact
                        your trainer or any member of the training staff.</DialogContentText>
                    <DialogContentText>Once preparation has been marked as completed, it cannot be
                        undone.</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button size="small" color="inherit" onClick={() => setOpen(false)}>Close</Button>
                    <Button variant="contained" size="small" startIcon={<Check/>} onClick={handleCompletePreparation}
                            disabled={appointment.preparation_completed}>Complete
                        Preparation</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
