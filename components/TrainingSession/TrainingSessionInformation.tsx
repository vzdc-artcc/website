'use client';
import React from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from "@mui/material";
import LessonRubricGrid from "@/components/Lesson/LessonRubricGrid";
import {ExpandMore} from "@mui/icons-material";
import {formatZuluDate, getDuration} from "@/lib/date";
import TrainingMarkdownSwitch from './TrainingMarkdownSwitch';
import PerformanceIndicatorInformation from "@/components/TrainingSession/PerformanceIndicatorInformation";
import Link from "next/link";
import {notFound} from "next/navigation";
import {useTrainingLessons, useTrainingSession} from "@/lib/osmium/hooks/training";

export default function TrainingSessionInformation({id, trainerView}: { id: string, trainerView?: boolean }) {

    const {data: trainingSession, isLoading} = useTrainingSession(id);
    const {data: lessonsData, isLoading: lessonsLoading} = useTrainingLessons();

    if (isLoading || lessonsLoading) {
        return <CircularProgress/>;
    }

    if (!trainingSession) {
        notFound();
    }

    const lessons = lessonsData?.items ?? [];
    const start = new Date(trainingSession.start);
    const end = new Date(trainingSession.end);
    const isOts = trainingSession.tickets.some((t) => lessons.find((l) => l.id === t.lesson_id)?.instructor_only);

    return (
        <Stack direction="column" spacing={2}>
            <Box>
                <Typography variant="h5"
                            color={isOts ? 'red' : 'inherit'}>{isOts ? 'OTS' : 'Training Session'}{trainerView ? ` - ${trainingSession.student_name} (${trainingSession.student_cid})` : ''}</Typography>
                {trainerView && <Typography variant="subtitle2" fontWeight="bold">{trainingSession.additional_comments &&
                    <span style={{color: 'green'}}>RMK</span>} {trainingSession.trainer_comments &&
                    <span style={{color: 'red'}}>RMK TRAINER</span>}</Typography>}
                <Typography
                    variant="subtitle1">Trainer{trainingSession.additional_trainers.length > 0 ? 's' : ''}: {trainingSession.instructor_name}{trainingSession.additional_trainers.length > 0 ? `, ${trainingSession.additional_trainers.map((at) => at.trainer_name).join(',')}` : ''}</Typography>
                <Typography
                    variant="subtitle2">{formatZuluDate(start)} - {formatZuluDate(end).substring(9)}</Typography>
                <Typography
                    variant="subtitle2">Duration: {getDuration(start, end)}</Typography>
            </Box>
            {trainerView && trainingSession.additional_trainers.length > 0 &&
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" sx={{mb: 1,}}>Additional Trainers</Typography>
                        {trainingSession.additional_trainers.map((at) =>
                            <Typography key={at.trainer_id}>{at.trainer_name} - {at.description}</Typography>)}
                    </CardContent>
                </Card>
            }
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>Lessons</Typography>
                    {trainingSession.tickets.map((ticket) => {
                        const lesson = lessons.find((l) => l.id === ticket.lesson_id);
                        return (
                            <Accordion key={ticket.id}>
                                <AccordionSummary expandIcon={<ExpandMore/>}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography>{lesson ? `${lesson.identifier} - ${lesson.name}` : ticket.lesson_id}</Typography>
                                        <Chip label={ticket.passed ? 'PASS' : 'FAIL'}
                                              color={ticket.passed ? 'success' : 'error'}/>
                                    </Stack>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="h6">Scoring</Typography>
                                            {lesson && <Typography variant="subtitle2">{lesson.position}</Typography>}
                                            <LessonRubricGrid lessonId={ticket.lesson_id}
                                                              scores={ticket.scores.map((s) => ({
                                                                  criteriaId: s.criteria_id,
                                                                  cellId: s.cell_id,
                                                              }))}/>
                                        </CardContent>
                                    </Card>
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </CardContent>
            </Card>
            {trainingSession.performance_indicator &&
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Performance Indicator</Typography>
                        {!trainerView &&
                            <Alert severity="info" sx={{mb: 2}}>Performance indicators do not dictate the outcome of a
                                lesson or session. They are only for reference and improvement.</Alert>}
                        <PerformanceIndicatorInformation performanceIndicator={trainingSession.performance_indicator}/>
                    </CardContent>
                </Card>}
            <TrainingMarkdownSwitch trainingSession={trainingSession} trainerView={trainerView}/>
            <Typography sx={{mt: 2}}>Questions? Email&nbsp;
                <Link href={'mailto:training@vzdc.org'} style={{color: 'inherit',}}>
                    training@vzdc.org
                </Link> or contact your trainer.
            </Typography>
        </Stack>
    );
}
