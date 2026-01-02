'use client';
import React, {useCallback, useEffect} from 'react';
import {Lesson, LessonRubricCell, LessonRubricCriteria, RubricCriteraScore} from "@prisma/client";
import {Alert, Autocomplete, Button, CircularProgress, Grid2, TextField} from "@mui/material";
import LessonRubricGridInteractive from "@/components/Lesson/LessonRubricGridInteractive";
import {getCriteriaForLesson} from "@/actions/trainingSessionFormHelper";
import {toast} from "react-toastify";
import {Check} from "@mui/icons-material";

export default function TrainingTicketForm({
                                               allLessons,
                                               lesson,
                                               scores,
                                               onSubmit
                                           }: {
    allLessons: Lesson[],
    lesson?: Lesson,
    scores?: RubricCriteraScore[],
    onSubmit: (lesson: Lesson, scores: RubricCriteraScore[]) => boolean
}) {

    const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(lesson || null);
    const [criteria, setCriteria] = React.useState<LessonRubricCriteria[]>();
    const [cells, setCells] = React.useState<LessonRubricCell[]>();
    const [rubricScores, setRubricScores] = React.useState<RubricCriteraScore[]>(scores || []);

    const getCriteria = useCallback(async (lessonId: string) => {
        const {criteria, cells} = await getCriteriaForLesson(lessonId);
        setCriteria(criteria);
        setCells(cells);
    }, []);

    const handleSubmit = async () => {
        if (!selectedLesson || !criteria || !cells) {
            toast('Please select a lesson', {type: 'error'});
            return;
        }
        const success = onSubmit(selectedLesson, rubricScores.length !== criteria.length ?
            criteria.map((criterion) => {
                return {
                    id: '',
                    criteriaId: criterion.id,
                    cellId: cells.find((cell) => cell.criteriaId === criterion.id && cell.points === 0)?.id || '',
                    trainingTicketId: null,
                    passed: false,
                };
            }) : rubricScores);
        if (success && !scores) {
            setRubricScores([]);
            setSelectedLesson(null);
            setCriteria(undefined);
            setCells(undefined);
        }
    }

    useEffect(() => {
        if (selectedLesson) {
            getCriteria(selectedLesson.id).then();
        }
    }, [getCriteria, selectedLesson]);

    return (
        (<Grid2 container columns={2} spacing={2}>
            <Grid2
                size={2}>
                <Autocomplete
                    disabled={!!scores}
                    options={allLessons}
                    getOptionLabel={(option) => `${option.identifier} - ${option.name}`}
                    value={selectedLesson}
                    onChange={(event, newValue) => {
                        setSelectedLesson(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Lesson (search name or identifier)"/>}
                />
            </Grid2>
            <Grid2 size={2}>
                {selectedLesson && (!criteria || !cells) && <CircularProgress/>}
                {criteria && cells && <LessonRubricGridInteractive criteria={criteria} cells={cells} scores={scores}
                                                                   updateScores={(scores) => {
                                                                       setRubricScores(Object.keys(scores).map((criteriaId) => {
                                                                           return {
                                                                               id: '',
                                                                               criteriaId,
                                                                               cellId: cells.find((cell) => cell.criteriaId === criteriaId && cell.points === scores[criteriaId])?.id || '',
                                                                               trainingTicketId: null,
                                                                               passed: scores[criteriaId] >= (criteria.find((c) => c.id === criteriaId)?.passing || 0),
                                                                           }
                                                                       }));
                                                                   }}/>}
            </Grid2>
            <Grid2 size={2}>
                <Button variant="contained" onClick={handleSubmit} startIcon={<Check/>}>Save Ticket</Button>
            </Grid2>
            <Grid2 size={2}>
                <Alert severity="warning">
                    If the lesson pass standards, criteria, or rubric cells have changed after the ticket was previously
                    saved, the ticket will be re-scored with the new criteria.
                </Alert>
            </Grid2>
        </Grid2>)
    );

}