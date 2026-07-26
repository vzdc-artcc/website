'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import LessonCriteriaCellForm from "@/components/Lesson/LessonCriteriaCellForm";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";
import {useTrainingLessons, useLessonRubric} from "@/lib/osmium/hooks/training";

export default function LessonCriteriaCellDetailView({lessonId, criteriaId, cellId}: {
    lessonId: string,
    criteriaId: string,
    cellId: string,
}) {

    const {data: lessonsData, isLoading: lessonsLoading} = useTrainingLessons();
    const {data: rubric, isLoading: rubricLoading} = useLessonRubric(lessonId);

    if (lessonsLoading || rubricLoading) {
        return <CircularProgress/>;
    }

    const lesson = lessonsData?.items.find((l) => l.id === lessonId);
    const criteria = rubric?.criteria.find((c) => c.id === criteriaId);
    const cell = criteria?.cells.find((c) => c.id === cellId);

    if (!lesson || !criteria || !cell) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Criteria cell not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Link href={`/training/lessons/${lessonId}/edit/${criteriaId}/`}
                          style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5">{criteria.criteria} ({lesson.identifier})</Typography>
                </Stack>
                <Typography variant="subtitle2" sx={{mb: 2,}}>{cell.points} points</Typography>
                <LessonCriteriaCellForm lesson={lesson} criteria={criteria} cell={cell}/>
            </CardContent>
        </Card>
    );
}
