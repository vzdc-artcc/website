'use client';
import React, {useEffect, useState} from 'react';
import {Lesson, PerformanceIndicatorTemplate} from "@/generated/prisma/browser";
import Form from "next/form";
import {Autocomplete, Box, CircularProgress, TextField} from "@mui/material";
import {fetchAllPerformanceIndicators, getLessonPerformanceIndicator} from "@/actions/performanceIndicator";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {updateLessonIndicator} from "@/actions/lesson";
import {toast} from "react-toastify";

export default function LessonPerformanceIndicatorForm({lesson}: { lesson: Lesson, }) {

    const [performanceIndicators, setPerformanceIndicators] = useState<PerformanceIndicatorTemplate[]>();
    const [selectedPerformanceIndicator, setSelectedPerformanceIndicator] = useState<PerformanceIndicatorTemplate>();

    useEffect(() => {
        fetchAllPerformanceIndicators().then((pis) => {
            setPerformanceIndicators(pis);
            getLessonPerformanceIndicator(lesson.id).then((lpi) => {
                setSelectedPerformanceIndicator(pis.find((pi) => pi.id === lpi?.templateId));
            });
        });
    }, [lesson]);

    const handleSubmit = async () => {
        const performanceIndicatorId = selectedPerformanceIndicator?.id;
        await updateLessonIndicator(lesson.id, performanceIndicatorId);

        toast.success('Performance Indicator updated.');
    }

    if (!performanceIndicators) {
        return <CircularProgress/>;
    }

    return (
        <Form action={handleSubmit}>
            <Autocomplete
                options={performanceIndicators}
                getOptionLabel={(option) => `${option.name}`}
                value={selectedPerformanceIndicator || null}
                onChange={(event, newValue) => {
                    setSelectedPerformanceIndicator(newValue || undefined);
                }}
                renderInput={(params) => <TextField {...params} label="Performance Indicator" variant="filled"/>}
            />
            <Box sx={{mt: 2,}}>
                <FormSaveButton/>
            </Box>
        </Form>
    );

}