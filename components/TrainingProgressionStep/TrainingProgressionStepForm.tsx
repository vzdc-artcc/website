'use client';
import React, {useState} from 'react';
import Form from "next/form";
import {Autocomplete, Box, FormControlLabel, Stack, Switch, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {
    useCreateTrainingProgressionStep,
    useTrainingLessons,
    useTrainingProgressionSteps,
    useUpdateTrainingProgressionStep
} from "@/lib/osmium/hooks/training";

interface LessonOption {
    id: string;
    identifier: string;
    name: string;
}

export default function TrainingProgressionStepForm({
                                                        trainingProgression,
                                                        trainingProgressionStep,
                                                        onSubmit
                                                    }: {
    trainingProgression: { id: string },
    trainingProgressionStep?: { id: string, lesson_id: string, sort_order: number, optional: boolean },
    onSubmit?: () => void
}) {

    const {data: lessonsData} = useTrainingLessons();
    const {data: stepsData} = useTrainingProgressionSteps();
    const createStep = useCreateTrainingProgressionStep();
    const updateStep = useUpdateTrainingProgressionStep();
    const allLessons: LessonOption[] = lessonsData?.items ?? [];

    const [selectedLesson, setSelectedLesson] = useState<LessonOption | null>(
        allLessons.find((l) => l.id === trainingProgressionStep?.lesson_id) || null
    );
    const [optional, setOptional] = useState<boolean>(trainingProgressionStep?.optional || false);

    const handleSubmit = async () => {
        if (!selectedLesson) {
            toast.error('Please select a lesson');
            return;
        }

        try {
            if (trainingProgressionStep) {
                await updateStep.mutateAsync({
                    stepId: trainingProgressionStep.id,
                    body: {lesson_id: selectedLesson.id, optional},
                });
            } else {
                const existingSteps = (stepsData?.items ?? []).filter((s) => s.progression_id === trainingProgression.id);
                const nextOrder = existingSteps.length > 0
                    ? Math.max(...existingSteps.map((s) => s.sort_order)) + 1
                    : 1;
                await createStep.mutateAsync({
                    progression_id: trainingProgression.id,
                    lesson_id: selectedLesson.id,
                    sort_order: nextOrder,
                    optional,
                });
            }

            toast.success(`Training progression step saved successfully`);
            setSelectedLesson(null);
            setOptional(false);
            onSubmit?.();
        } catch {
            toast.error("Failed to save training progression step.");
        }
    }

    return (
        <Form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <Autocomplete
                    options={allLessons}
                    getOptionLabel={(option) => `${option.identifier} - ${option.name}`}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    value={selectedLesson}
                    onChange={(event, newValue) => {
                        setSelectedLesson(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Lesson (search name or identifier)"/>}
                />
                <FormControlLabel name="optional"
                                  control={<Switch checked={optional} onChange={(e, c) => setOptional(c)}/>}
                                  label="Optional?"/>
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </Form>
    );

}
