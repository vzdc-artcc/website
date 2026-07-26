'use client';
import React from 'react';
import {
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import LessonRubricCriteriaForm from "@/components/Lesson/LessonRubricCriteriaForm";
import Link from "next/link";
import {ArrowBack, Edit} from "@mui/icons-material";
import LessonCriteriaCellDeleteButton from "@/components/Lesson/LessonCriteriaCellDeleteButton";
import LessonCriteriaCellForm from "@/components/Lesson/LessonCriteriaCellForm";
import {useTrainingLessons, useLessonRubric} from "@/lib/osmium/hooks/training";

export default function LessonCriteriaDetailView({lessonId, criteriaId}: { lessonId: string, criteriaId: string }) {

    const {data: lessonsData, isLoading: lessonsLoading} = useTrainingLessons();
    const {data: rubric, isLoading: rubricLoading} = useLessonRubric(lessonId);

    if (lessonsLoading || rubricLoading) {
        return <CircularProgress/>;
    }

    const lesson = lessonsData?.items.find((l) => l.id === lessonId);
    const criteria = rubric?.criteria.find((c) => c.id === criteriaId);

    if (!lesson || !criteria) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Criteria not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Link href={`/training/lessons/${lessonId}/edit`}>
                        <IconButton size="large">
                            <ArrowBack/>
                        </IconButton>
                    </Link>
                    <Typography variant="h5">{criteria.criteria}</Typography>
                </Stack>
                <Typography variant="subtitle2"
                            sx={{mb: 2,}}>{lesson.identifier} - {lesson.name}</Typography>
                <LessonRubricCriteriaForm lesson={lesson} criteria={criteria}/>
                <Stack direction="column" spacing={2} sx={{mt: 2,}}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" sx={{mb: 2,}}>Criteria Cells</Typography>
                            {criteria.cells.length === 0 &&
                                <Typography>No criteria cells found; create one below.</Typography>}
                            {criteria.cells.length > 0 && <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Points</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {criteria.cells.map((cell) => (
                                            <TableRow key={cell.id}>
                                                <TableCell>{cell.description}</TableCell>
                                                <TableCell>{cell.points}</TableCell>
                                                <TableCell>
                                                    <Link
                                                        href={`/training/lessons/${lessonId}/edit/${criteria.id}/${cell.id}`}>
                                                        <IconButton size="small">
                                                            <Edit/>
                                                        </IconButton>
                                                    </Link>
                                                    <LessonCriteriaCellDeleteButton lessonId={lessonId}
                                                                                    criteriaId={criteria.id}
                                                                                    criteriaCell={cell}/>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>}
                        </CardContent>
                    </Card>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" sx={{mb: 2,}}>New Criteria Cell</Typography>
                            <LessonCriteriaCellForm lesson={lesson} criteria={criteria}/>
                        </CardContent>
                    </Card>

                </Stack>
            </CardContent>
        </Card>
    );
}
