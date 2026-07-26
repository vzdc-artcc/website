'use client';
import React from 'react';
import {Card, CardContent, CircularProgress, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import Markdown from "react-markdown";
import LessonRubricGrid from "@/components/Lesson/LessonRubricGrid";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";
import {useTrainingLessons} from "@/lib/osmium/hooks/training";

export default function LessonCard({lessonId}: { lessonId: string }) {

    const {data, isLoading} = useTrainingLessons();
    const lesson = data?.items.find((l) => l.id === lessonId);

    if (isLoading) {
        return <CircularProgress/>;
    }

    if (!lesson) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5">Lesson not found.</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Link href={`/training/lessons/`}
                          style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                    <Typography variant="h5">{lesson.facility} - {lesson.name}</Typography>
                </Stack>
                <Typography variant="subtitle2">{lesson.identifier}</Typography>
                <Typography variant="subtitle2">{lesson.position}</Typography>
                <Typography variant="subtitle2">{lesson.duration} minutes</Typography>
                <Markdown>
                    {lesson.description}
                </Markdown>
                <Typography variant="h6">Grading</Typography>
                <LessonRubricGrid lessonId={lessonId}/>
            </CardContent>
        </Card>
    );
}
