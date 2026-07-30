'use client';
import React, {useState} from 'react';
import Form from "next/form";
import {Autocomplete, Box, CircularProgress, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {usePerformanceIndicatorTemplates, useUpdateTrainingLesson} from "@/lib/osmium/hooks/training";

interface LessonLike {
    id: string;
    identifier: string;
    location: number;
    name: string;
    description: string;
    position: string;
    facility: string;
    duration: number;
    trainee_preparation?: string | null;
    instructor_only: boolean;
    notify_instructor_on_pass: boolean;
    release_request_on_pass: boolean;
    performance_indicator_template_id?: string | null;
}

export default function LessonPerformanceIndicatorForm({lesson}: { lesson: LessonLike, }) {

    const {data, isLoading} = usePerformanceIndicatorTemplates();
    const updateLesson = useUpdateTrainingLesson();
    const templates = data?.items ?? [];
    const [selected, setSelected] = useState(() => templates.find((t) => t.id === lesson.performance_indicator_template_id));

    React.useEffect(() => {
        setSelected(templates.find((t) => t.id === lesson.performance_indicator_template_id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, lesson.performance_indicator_template_id]);

    const handleSubmit = async () => {
        try {
            await updateLesson.mutateAsync({
                lessonId: lesson.id,
                body: {
                    identifier: lesson.identifier,
                    location: lesson.location,
                    name: lesson.name,
                    description: lesson.description,
                    position: lesson.position,
                    facility: lesson.facility,
                    duration: lesson.duration,
                    trainee_preparation: lesson.trainee_preparation ?? null,
                    instructor_only: lesson.instructor_only,
                    notify_instructor_on_pass: lesson.notify_instructor_on_pass,
                    release_request_on_pass: lesson.release_request_on_pass,
                    performance_indicator_template_id: selected?.id ?? null,
                },
            });
            toast.success('Performance Indicator updated.');
        } catch {
            toast.error('Failed to update Performance Indicator.');
        }
    }

    if (isLoading) {
        return <CircularProgress/>;
    }

    return (
        <Form action={handleSubmit}>
            <Autocomplete
                options={templates}
                getOptionLabel={(option) => `${option.name}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                value={selected || null}
                onChange={(event, newValue) => {
                    setSelected(newValue || undefined);
                }}
                renderInput={(params) => <TextField {...params} label="Performance Indicator" variant="filled"/>}
            />
            <Box sx={{mt: 2,}}>
                <FormSaveButton/>
            </Box>
        </Form>
    );

}
