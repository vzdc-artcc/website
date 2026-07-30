'use client';
import React, {useEffect, useState} from 'react';
import {Alert, Autocomplete, Button, CircularProgress, Grid, TextField} from "@mui/material";
import LessonRubricGridInteractive from "@/components/Lesson/LessonRubricGridInteractive";
import {useLessonRubric, useTrainingLessons} from "@/lib/osmium/hooks/training";
import {toast} from "react-toastify";
import {Check} from "@mui/icons-material";

interface LessonLike {
    id: string;
    identifier: string;
    name: string;
}

interface ScoreLike {
    criteria_id: string;
    cell_id: string;
    passed: boolean;
}

export default function TrainingTicketForm({
                                               lesson,
                                               scores,
                                               onSubmit
                                           }: {
    lesson?: LessonLike,
    scores?: ScoreLike[],
    onSubmit: (lesson: LessonLike, scores: ScoreLike[]) => boolean
}) {

    const {data: lessonsData} = useTrainingLessons();
    const allLessons: LessonLike[] = lessonsData?.items ?? [];

    const [selectedLesson, setSelectedLesson] = useState<LessonLike | null>(lesson || null);
    const [rubricScores, setRubricScores] = useState<ScoreLike[]>(scores || []);

    const {data: rubric, isLoading: rubricLoading, isError: rubricError} = useLessonRubric(selectedLesson?.id);
    const criteria = rubricError ? [] : (rubric?.criteria ?? []);

    useEffect(() => {
        setRubricScores(scores || []);
    }, [scores]);

    const handleSubmit = async () => {
        if (!selectedLesson || rubricLoading) {
            toast('Please select a lesson', {type: 'error'});
            return;
        }

        const finalScores = rubricScores.length !== criteria.length ?
            criteria.map((criterion) => ({
                criteria_id: criterion.id,
                cell_id: criterion.cells.find((cell) => cell.points === 0)?.id || '',
                passed: false,
            })) : rubricScores;

        const success = onSubmit(selectedLesson, finalScores);
        if (success && !scores) {
            setRubricScores([]);
            setSelectedLesson(null);
        }
    }

    return (
        (<Grid container columns={2} spacing={2}>
            <Grid
                size={2}>
                <Autocomplete
                    disabled={!!scores}
                    options={allLessons}
                    getOptionLabel={(option) => `${option.identifier} - ${option.name}`}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    value={selectedLesson}
                    onChange={(event, newValue) => {
                        setSelectedLesson(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Lesson (search name or identifier)"/>}
                />
            </Grid>
            <Grid size={2}>
                {selectedLesson && rubricLoading && <CircularProgress/>}
                {selectedLesson && !rubricLoading && criteria.length > 0 &&
                    <LessonRubricGridInteractive criteria={criteria} scores={scores}
                                                 updateScores={(pointsByCriteria) => {
                                                     setRubricScores(Object.keys(pointsByCriteria).map((criteriaId) => {
                                                         const criterion = criteria.find((c) => c.id === criteriaId);
                                                         return {
                                                             criteria_id: criteriaId,
                                                             cell_id: criterion?.cells.find((cell) => cell.points === pointsByCriteria[criteriaId])?.id || '',
                                                             passed: pointsByCriteria[criteriaId] >= (criterion?.passing || 0),
                                                         };
                                                     }));
                                                 }}/>}
            </Grid>
            <Grid size={2}>
                <Button variant="contained" onClick={handleSubmit} startIcon={<Check/>}>Save Ticket</Button>
            </Grid>
            <Grid size={2}>
                <Alert severity="warning">
                    If the lesson pass standards, criteria, or rubric cells have changed after the ticket was previously
                    saved, the ticket will be re-scored with the new criteria.
                </Alert>
            </Grid>
        </Grid>)
    );

}
