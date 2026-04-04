'use client';
import React, {useState} from 'react';
import {Lesson, LessonRubricCriteria} from "@prisma/client";
import {Box, Grid, TextField, Typography, useTheme} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdateLessonRubricCriteria} from "@/actions/lessonRubricCriteria";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function LessonRubricCriteriaForm({lesson, criteria}: {
    lesson: Lesson,
    criteria?: LessonRubricCriteria
}) {

    const theme = useTheme();
    const router = useRouter();
    const [description, setDescription] = useState(criteria?.description || '');

    const handleSubmit = async (formData: FormData) => {
        const {rubricCriteria, errors,} = await createOrUpdateLessonRubricCriteria(formData);
        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'});
            return;
        }

        if (!criteria?.id) {
            router.push(`/training/lessons/${lesson.id}/edit/${rubricCriteria?.id}`);
        }
        toast("Criteria saved successfully!", {type: 'success'});
    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="lessonId" value={lesson.id}/>
            <input type="hidden" name="rubricCriteriaId" value={criteria?.id || ''}/>
            <input type="hidden" name="rubricId" value={lesson?.rubricId || ''}/>
            <input type="hidden" name="description" value={description}/>
            <Grid container columns={2} spacing={2}>
                <Grid size={2}>
                    <TextField fullWidth required variant="filled" name="criteria" label="Name"
                               defaultValue={criteria?.criteria || ''}/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth required variant="filled" type="number" name="maxPoints" label="Maximum Points"
                               defaultValue={criteria?.maxPoints || 0}/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth required variant="filled" type="number" name="passing" label="Passing Points"
                               defaultValue={criteria?.passing || 0}
                               helperText="The smallest number of points required to pass this criteria."/>
                </Grid>
                <Grid size={2}>
                    <Box sx={{maxWidth: '700px',}} data-color-mode={theme.palette.mode}>
                        <Typography variant="subtitle1" sx={{mb: 1,}}>Description</Typography>
                        <MarkdownEditor
                            enableScroll={false}
                            minHeight="300px"
                            value={description}
                            onChange={(d) => setDescription(d)}
                        />
                    </Box>
                </Grid>
                <Grid size={2}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>)
    );
}