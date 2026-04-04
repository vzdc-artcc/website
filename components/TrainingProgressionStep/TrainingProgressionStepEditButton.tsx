'use client';
import React, {useState} from 'react';
import {Lesson, TrainingProgression} from "@/generated/prisma/browser";
import {GridActionsCellItem} from "@mui/x-data-grid";
import {Edit} from "@mui/icons-material";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Tooltip} from "@mui/material";
import TrainingProgressionStepForm, {
    TrainingProgressionStepWithLesson
} from "@/components/TrainingProgressionStep/TrainingProgressionStepForm";

export default function TrainingProgressionStepEditButton({trainingProgression, trainingProgressionStep, allLessons}: {
    trainingProgression: TrainingProgression,
    trainingProgressionStep: TrainingProgressionStepWithLesson,
    allLessons: Lesson[],
}) {

    const [open, setOpen] = useState(false);

    return (
        <>
            <Tooltip title="Edit Training Progression Step">
                <GridActionsCellItem
                    icon={<Edit/>}
                    label="Edit Training Progression Step"
                    onClick={() => setOpen(true)}
                />
            </Tooltip>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Edit Training Progression Step</DialogTitle>
                <DialogContent>
                    <DialogContentText gutterBottom>
                        Lesson has to be unique to the training progression.
                    </DialogContentText>
                    <TrainingProgressionStepForm allLessons={allLessons} trainingProgression={trainingProgression}
                                                 trainingProgressionStep={trainingProgressionStep}
                                                 onSubmit={() => setOpen(false)}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );

}