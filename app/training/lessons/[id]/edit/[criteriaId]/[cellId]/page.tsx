import React from 'react';
import {Card, CardContent, IconButton, Stack, Tooltip, Typography} from "@mui/material";
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import LessonCriteriaCellForm from "@/components/Lesson/LessonCriteriaCellForm";
import Link from "next/link";
import {ArrowBack} from "@mui/icons-material";

export default async function Page(
    props: { params: Promise<{ id: string, criteriaId: string, cellId: string }> }
) {
    const params = await props.params;

    const {cellId, criteriaId} = params;

    const cell = await prisma.lessonRubricCell.findUnique({
        where: {
            id: cellId,
        },
        include: {
            criteria: {
                include: {
                    rubric: {
                        include: {
                            Lesson: true,
                        },
                    },
                },
            },
        },
    });

    const criteria = await prisma.lessonRubricCriteria.findUnique({
        where: {
            id: criteriaId,
        },
        include: {
            rubric: {
                include: {
                    Lesson: true,
                },
            },
            cells: {
                orderBy: {
                    points: 'asc',
                },
            },
        },
    });

    if (!cell) {
        notFound();
    }

    if (!criteria) {
        notFound();
    }

    return cell.criteria.rubric.Lesson && (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={2} sx={{
                    alignItems: "center"
                }}>
                    <Link href={`/training/lessons/${criteria.rubric.Lesson?.id}/edit/${criteria.id}/`}
                          style={{color: 'inherit',}}>
                        <Tooltip title="Go Back">
                            <IconButton color="inherit">
                                <ArrowBack fontSize="large"/>
                            </IconButton>
                        </Tooltip>
                    </Link>
                   <Typography
                    variant="h5">{cell.criteria.criteria} ({cell.criteria.rubric.Lesson.identifier})</Typography>
                </Stack>
                <Typography variant="subtitle2" sx={{mb: 2,}}>{cell.points} points</Typography>
                <LessonCriteriaCellForm lesson={cell.criteria.rubric.Lesson} criteria={cell.criteria} cell={cell}/>
            </CardContent>
        </Card>
    );
}