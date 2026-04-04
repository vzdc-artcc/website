'use client';
import React, {useState} from 'react';
import {LessonRubricCell, LessonRubricCriteria, RubricCriteraScore} from "@/generated/prisma/browser";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip} from "@mui/material";
import Markdown from "react-markdown";

export default function LessonRubricGridInteractive({criteria, cells, scores, updateScores}: {
    criteria: LessonRubricCriteria[],
    cells: LessonRubricCell[],
    scores?: RubricCriteraScore[]
    updateScores: (scores: Record<string, number>) => void
}) {

    const [selectedScores, setSelectedScores] = useState<Record<string, number>>(criteria.reduce((acc, criterion) => {
        const score = scores?.find((score) => score.criteriaId === criterion.id);
        acc[criterion.id as string] = cells.find((cell) => cell.id === score?.cellId)?.points || 0;
        return acc;
    }, {} as any));

    const maxPoints = Math.max(...criteria.map(criterion => criterion.maxPoints));

    const handleCellClick = (criterionId: string, points: number) => {
        const newScores = {
            ...selectedScores,
            [criterionId]: points,
        };
        setSelectedScores(newScores);
        updateScores(newScores);
    }

    return (
        <>
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
                        {criteria.map((criterion) => (
                            <TableRow key={criterion.id}>
                                <Tooltip title={<Markdown>{criterion.description}</Markdown>}>
                                    <TableCell>{criterion.criteria}</TableCell>
                                </Tooltip>
                                {Array.from({length: criterion.maxPoints + 1}, (_, i) => i).map((point) => (
                                    <TableCell key={point} align="center"
                                               onClick={() => handleCellClick(criterion.id, point)} sx={{
                                        border: 1,
                                        backgroundColor: selectedScores[criterion.id] === point ? (
                                            point >= criterion.passing ? 'rgba(0, 200, 0, 0.2)' : 'rgba(200, 0, 0, 0.2)'
                                        ) : 'inherit',
                                        cursor: 'pointer',
                                    }}>
                                        {cells.filter((c) => c.criteriaId === criterion.id).find((cell) => cell.points === point)?.description}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}