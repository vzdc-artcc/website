import React from 'react';
import {RubricCriteraScore} from "@/generated/prisma/browser";
import prisma from "@/lib/db";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip} from "@mui/material";
import Markdown from "react-markdown";

export default async function LessonRubricGrid({lessonId, scores}: {
    lessonId: string,
    scores?: RubricCriteraScore[]
}) {

    const criteria = await prisma.lessonRubricCriteria.findMany({
        where: {
            rubric: {
                Lesson: {
                    id: lessonId,
                },
            },
        },
        include: {
            cells: true,
        },
        orderBy: {
            cells: {
                _count: 'asc',
            },
        }
    });

    const maxPoints = Math.max(...criteria.map(criterion => criterion.maxPoints));

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Criteria (hover for description)</TableCell>
                        {Array.from({length: maxPoints + 1}, (_, i) => i).map((point) => (
                            <TableCell key={point} align="center">{point}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {criteria.map((criterion) => {

                        const scoreCellId = scores?.find((score) => score.criteriaId === criterion.id)?.cellId;

                        return (
                            <TableRow key={criterion.id}>
                                <Tooltip title={<Markdown>{criterion.description}</Markdown>}>
                                    <TableCell>{criterion.criteria}</TableCell>
                                </Tooltip>
                                {Array.from({length: criterion.maxPoints + 1}, (_, i) => i).map((point) => (
                                    <TableCell key={point} align="center" sx={{
                                        border: 1,
                                        backgroundColor: criterion.cells.find((cell) => cell.points === point)?.id === scoreCellId ? (
                                            point >= criterion.passing ? 'rgba(0, 200, 0, 0.2)' : 'rgba(200, 0, 0, 0.2)'
                                        ) : 'inherit',
                                    }}>
                                        {criterion.cells.find((cell) => cell.points === point)?.description}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}