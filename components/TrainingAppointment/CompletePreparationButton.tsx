'use client';
import React, {useState} from 'react';
import {Lesson, TrainingAppointment} from "@prisma/client";
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
import {completePreparation} from "@/actions/trainingAppointment";
import {toast} from "react-toastify";

export default function CompletePreparationButton({trainingAppointment, lessons}: {
    trainingAppointment: TrainingAppointment,
    lessons: Lesson[],
}) {

    const [open, setOpen] = useState(false);

    const handleCompletePreparation = async () => {
        await completePreparation(trainingAppointment.id);
        toast.success("Preparation completed successfully!  Your trainer has been notified.");
        setOpen(false);
    }

    return (
        <>
            <Button variant="contained"
                    startIcon={trainingAppointment.preparationCompleted ? <Check/> : <LocalLibrary/>}
                    disabled={trainingAppointment.preparationCompleted}
                    onClick={() => setOpen(true)}>{trainingAppointment.preparationCompleted ? 'Preparation Completed' : 'Complete Preparation'}</Button>
            {trainingAppointment.preparationCompleted &&
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
                        {lessons.map((lesson) => (
                            <Accordion key={lesson.id}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Typography>{lesson.identifier} - {lesson.name}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>{lesson.traineePreparation ?
                                        <Markdown>{lesson.traineePreparation}</Markdown> : 'There is no trainee preparation for this lesson.'}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))}
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
                            disabled={trainingAppointment.preparationCompleted}>Complete
                        Preparation</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}