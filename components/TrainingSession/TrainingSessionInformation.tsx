import React from 'react';
import {notFound} from "next/navigation";
import prisma from "@/lib/db";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import LessonRubricGrid from "@/components/Lesson/LessonRubricGrid";
import {ExpandMore} from "@mui/icons-material";
import Markdown from "react-markdown";
import {formatZuluDate, getDuration} from "@/lib/date";
import TrainingMarkdownSwitch from './TrainingMarkdownSwitch';
import PerformanceIndicatorInformation from "@/components/TrainingSession/PerformanceIndicatorInformation";
import Link from "next/link";

export default async function TrainingSessionInformation({id, trainerView}: { id: string, trainerView?: boolean }) {

    const trainingSession = await prisma.trainingSession.findUnique({
        where: {
            id
        },
        include: {
            student: true,
            instructor: true,
            tickets: {
                include: {
                    lesson: true,
                    mistakes: true,
                    scores: true,
                }
            },
            performanceIndicator: {
                include: {
                    categories: {
                        orderBy: {
                            order: 'asc',
                        },
                        include: {
                            criteria: {
                                orderBy: {
                                    order: 'asc',
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!trainingSession) {
        notFound();
    }

    const isOts = trainingSession.tickets.some((t) => t.lesson.instructorOnly);

    return (
        <Stack direction="column" spacing={2}>
            <Box>
                <Typography variant="h5"
                            color={isOts ? 'red' : 'inherit'}>{isOts ? 'OTS' : 'Training Session'}{trainerView ? ` - ${trainingSession.student.firstName} ${trainingSession.student.lastName} (${trainingSession.student.cid})` : ''}</Typography>
                {trainerView && <Typography variant="subtitle2" fontWeight="bold">{trainingSession.additionalComments &&
                    <span style={{color: 'green'}}>RMK</span>} {trainingSession.trainerComments &&
                    <span style={{color: 'red'}}>RMK TRAINER</span>}</Typography>}
                {trainerView && trainingSession.student.controllerStatus === 'VISITOR' &&
                    <Typography variant="subtitle2" color="orange">VISITOR</Typography>}
                {trainerView && trainingSession.student.controllerStatus === 'NONE' &&
                    <Typography color="red">NOT ROSTERED</Typography>}
                <Typography
                    variant="subtitle1">Trainer: {trainingSession.instructor.firstName} {trainingSession.instructor.lastName} ({trainingSession.instructor.cid})</Typography>
                <Typography
                    variant="subtitle2">{formatZuluDate(trainingSession.start)} - {formatZuluDate(trainingSession.end).substring(9)}</Typography>
                <Typography
                    variant="subtitle2">Duration: {getDuration(trainingSession.start, trainingSession.end)}</Typography>
            </Box>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>Lessons</Typography>
                    {trainingSession.tickets.map((ticket) => (
                        <Accordion key={ticket.id}>
                            <AccordionSummary expandIcon={<ExpandMore/>}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography>{ticket.lesson.identifier} - {ticket.lesson.name}</Typography>
                                    <Chip label={ticket.passed ? 'PASS' : 'FAIL'}
                                          color={ticket.passed ? 'success' : 'error'}/>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Stack direction="column" spacing={2}>
                                            <Box>
                                                <Typography variant="h6">Scoring</Typography>
                                                <Typography variant="subtitle2">{ticket.lesson.position}</Typography>
                                                <LessonRubricGrid lessonId={ticket.lesson.id} scores={ticket.scores}/>
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{mb: 1,}}>Mistakes</Typography>
                                                {ticket.mistakes.length === 0 &&
                                                    <Typography>No common mistakes observed.</Typography>}
                                                {ticket.mistakes.map((mistake) => (
                                                    <Accordion key={mistake.id}>
                                                        <AccordionSummary expandIcon={<ExpandMore/>}>
                                                            <Typography>{mistake.facility ? `${mistake.facility} - ` : ''}{mistake.name}</Typography>
                                                        </AccordionSummary>
                                                        <AccordionDetails>
                                                            <Markdown>{mistake.description}</Markdown>
                                                        </AccordionDetails>
                                                    </Accordion>
                                                ))}
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </CardContent>
            </Card>
            {trainingSession.performanceIndicator &&
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Performance Indicator</Typography>
                        <Alert severity="info" sx={{mb: 2}}>Performance indicators do not dictate the outcome of a
                            lesson or session. They are only for reference and improvement.</Alert>
                        <PerformanceIndicatorInformation performanceIndicator={trainingSession.performanceIndicator}/>
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