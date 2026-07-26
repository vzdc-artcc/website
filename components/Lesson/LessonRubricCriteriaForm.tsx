'use client';
import React, {useState} from 'react';
import {Box, Grid, TextField, Typography, useTheme} from "@mui/material";
import MarkdownEditor from "@uiw/react-markdown-editor";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useCreateLessonRubricCriteria, useUpdateLessonRubricCriteria} from "@/lib/osmium/hooks/training";

interface RubricCriteriaLike {
    id: string;
    criteria: string;
    description: string;
    max_points: number;
    passing: number;
    sort_order: number;
}

export default function LessonRubricCriteriaForm({lesson, criteria}: {
    lesson: { id: string },
    criteria?: RubricCriteriaLike
}) {

    const theme = useTheme();
    const router = useRouter();
    const createCriteria = useCreateLessonRubricCriteria(lesson.id);
    const updateCriteria = useUpdateLessonRubricCriteria(lesson.id);
    const [description, setDescription] = useState(criteria?.description || '');

    const handleSubmit = async (formData: FormData) => {
        const body = {
            criteria: formData.get('criteria') as string,
            description,
            max_points: Number(formData.get('maxPoints')),
            passing: Number(formData.get('passing')),
            sort_order: criteria?.sort_order,
        };

        try {
            if (criteria) {
                await updateCriteria.mutateAsync({criteriaId: criteria.id, body});
            } else {
                const created = await createCriteria.mutateAsync(body);
                router.push(`/training/lessons/${lesson.id}/edit/${created!.id}`);
            }
            toast("Criteria saved successfully!", {type: 'success'});
        } catch {
            toast("Failed to save criteria.", {type: 'error'});
        }
    }

    return (
        (<form action={handleSubmit}>
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
                               defaultValue={criteria?.max_points || 0}/>
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
