'use client';
import React from 'react';
import {Grid, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useCreateLessonRubricCell, useUpdateLessonRubricCell} from "@/lib/osmium/hooks/training";

export default function LessonCriteriaCellForm({lesson, criteria, cell}: {
    lesson: { id: string },
    criteria: { id: string, max_points: number },
    cell?: { id: string, points: number, description: string }
}) {

    const router = useRouter();
    const createCell = useCreateLessonRubricCell(lesson.id);
    const updateCell = useUpdateLessonRubricCell(lesson.id);

    const handleSubmit = async (formData: FormData) => {
        const body = {
            points: Number(formData.get('points')),
            description: formData.get('description') as string,
        };

        try {
            if (cell) {
                await updateCell.mutateAsync({criteriaId: criteria.id, cellId: cell.id, body});
            } else {
                await createCell.mutateAsync({criteriaId: criteria.id, body});
            }
            router.replace(`/training/lessons/${lesson.id}/edit/${criteria.id}`);
            toast("Criteria cell saved successfully!", {type: 'success'});
        } catch {
            toast("Failed to save criteria cell.", {type: 'error'});
        }
    }

    return (
        (<form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" type="number" required name="points" label="Points"
                               helperText={`Points must be less than or equal to the maximum points in this criteria: ${criteria.max_points}`}
                               defaultValue={cell?.points || 0}/>
                </Grid>
                <Grid
                    size={{
                        xs: 2,
                        md: 1
                    }}>
                    <TextField fullWidth variant="filled" type="text" required name="description" label="Description"
                               helperText="The description should give trainers an idea of what fits in this point category.  It should be short and mention specifics (ex. No more than 2 clearances missed)."
                               defaultValue={cell?.description || ''}/>
                </Grid>
                <Grid size={2}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>)
    );
}
