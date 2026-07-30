'use client';
import React from 'react';
import {
    Card,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from "@mui/material";
import Link from "next/link";
import {ArrowBack, Edit} from "@mui/icons-material";
import LessonRubricCriteriaDeleteButton from "@/components/Lesson/LessonRubricCriteriaDeleteButton";
import LessonForm from "@/components/Lesson/LessonForm";
import LessonRubricCriteriaForm from "@/components/Lesson/LessonRubricCriteriaForm";
import LessonPerformanceIndicatorForm from "@/components/Lesson/LessonPerformanceIndicatorForm";
import {useTrainingLessons, useLessonRubric} from "@/lib/osmium/hooks/training";

export default function LessonEditView({lessonId}: { lessonId: string }) {

    const {data: lessonsData, isLoading: lessonsLoading} = useTrainingLessons();
    const {data: rubric, isLoading: rubricLoading} = useLessonRubric(lessonId);

    if (lessonsLoading || rubricLoading) {
        return <CircularProgress/>;
    }

    const lesson = lessonsData?.items.find((l) => l.id === lessonId);

    if (!lesson) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Lesson not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    const criteria = rubric?.criteria ?? [];

    return (
        <Grid container spacing={2} columns={2}>
            <Grid size={2}>
                <Card>
                    <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{mb: 2,}}>
                            <Link href={`/training/lessons/`}
                                  style={{color: 'inherit',}}>
                                <Tooltip title="Go Back">
                                    <IconButton color="inherit">
                                        <ArrowBack fontSize="large"/>
                                    </IconButton>
                                </Tooltip>
                            </Link>
                            <Typography variant="h5" sx={{mb: 2,}}>{lesson.identifier} - {lesson.name}</Typography>
                        </Stack>
                        <LessonForm lesson={lesson}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={2}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2,}}>Performance Indicator</Typography>
                        <LessonPerformanceIndicatorForm lesson={lesson}/>
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 2, md: 1,}}>
                <Card sx={{height: '100%',}}>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Lesson Rubric Criteria</Typography>
                        {criteria.length === 0 &&
                            <Typography>No criteria found; create one below.</Typography>}
                        {criteria.length > 0 && <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Criteria</TableCell>
                                        <TableCell>Cells</TableCell>
                                        <TableCell>Max Points</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {criteria.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell>{c.criteria}</TableCell>
                                            <TableCell>{c.cells.length}</TableCell>
                                            <TableCell>{c.max_points}</TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/training/lessons/${lesson.id}/edit/${c.id}`}>
                                                    <IconButton size="small">
                                                        <Edit/>
                                                    </IconButton>
                                                </Link>
                                                <LessonRubricCriteriaDeleteButton lessonId={lesson.id} rubricCriteria={c}/>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>}
                    </CardContent>
                </Card>
            </Grid>
            <Grid size={{xs: 2, md: 1,}}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 2,}}>New Lesson Rubric Criteria</Typography>
                        <LessonRubricCriteriaForm lesson={lesson}/>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
}
