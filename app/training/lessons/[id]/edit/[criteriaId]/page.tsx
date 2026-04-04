import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {
    Card,
    CardContent,
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
import {LessonRubricCriteria} from "@/generated/prisma/client";
import Link from "next/link";
import {ArrowBack, Edit} from "@mui/icons-material";
import LessonCriteriaCellDeleteButton from "@/components/Lesson/LessonCriteriaCellDeleteButton";
import LessonCriteriaCellForm from "@/components/Lesson/LessonCriteriaCellForm";

export default async function Page(props: { params: Promise<{ id: string, criteriaId: string }> }) {
    const params = await props.params;

    const {id, criteriaId} = params;

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

    if (!criteria) {
        notFound();
    }

    return criteria.rubric.Lesson && (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Link href={`/training/lessons/${id}/edit`}>
                        <IconButton size="large">
                            <ArrowBack/>
                        </IconButton>
                    </Link>
                    <Typography variant="h5">{criteria.criteria}</Typography>
                </Stack>
                <Typography variant="subtitle2"
                            sx={{mb: 2,}}>{criteria.rubric.Lesson.identifier} - {criteria.rubric.Lesson.name}</Typography>
                <LessonRubricCriteriaForm lesson={criteria.rubric.Lesson} criteria={criteria as LessonRubricCriteria}/>
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
                                                        href={`/training/lessons/${criteria.rubric.Lesson?.id}/edit/${criteria.id}/${cell.id}`}>
                                                        <IconButton size="small">
                                                            <Edit/>
                                                        </IconButton>
                                                    </Link>
                                                    <LessonCriteriaCellDeleteButton criteriaCell={cell}/>
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
                            <LessonCriteriaCellForm lesson={criteria.rubric.Lesson} criteria={criteria}/>
                        </CardContent>
                    </Card>

                </Stack>
            </CardContent>
        </Card>
    );
}