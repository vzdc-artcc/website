import React from 'react';
import {Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import Markdown from "react-markdown";
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import LessonRubricGrid from "@/components/Lesson/LessonRubricGrid";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";

export default async function LessonCard({lessonId}: { lessonId: string }) {

    const lesson = await prisma.lesson.findUnique({
        where: {
            id: lessonId,
        },
        include: {
            rubric: {
                include: {
                    items: {
                        include: {
                            cells: true,
                        },
                    },
                },
            },
        },
    });

    if (!lesson) {
        notFound();
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