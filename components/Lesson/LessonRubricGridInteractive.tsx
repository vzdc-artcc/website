'use client';
import React, {useState} from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip} from "@mui/material";
import Markdown from "react-markdown";

interface CellLike {
    id: string;
    points: number;
    description: string;
}

interface CriterionLike {
    id: string;
    criteria: string;
    description: string;
    passing: number;
    max_points: number;
    cells: CellLike[];
}

export default function LessonRubricGridInteractive({criteria, scores, updateScores}: {
    criteria: CriterionLike[],
    scores?: { criteria_id: string, cell_id: string }[]
    updateScores: (scores: Record<string, number>) => void
}) {

    const [selectedScores, setSelectedScores] = useState<Record<string, number>>(() => criteria.reduce((acc, criterion) => {
        const score = scores?.find((score) => score.criteria_id === criterion.id);
        acc[criterion.id] = criterion.cells.find((cell) => cell.id === score?.cell_id)?.points || 0;
        return acc;
    }, {} as Record<string, number>));

    const maxPoints = Math.max(...criteria.map(criterion => criterion.max_points));

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
                                {Array.from({length: criterion.max_points + 1}, (_, i) => i).map((point) => (
                                    <TableCell key={point} align="center"
                                               onClick={() => handleCellClick(criterion.id, point)} sx={{
                                        border: 1,
                                        backgroundColor: selectedScores[criterion.id] === point ? (
                                            point >= criterion.passing ? 'rgba(0, 200, 0, 0.2)' : 'rgba(200, 0, 0, 0.2)'
                                        ) : 'inherit',
                                        cursor: 'pointer',
                                    }}>
                                        {criterion.cells.find((cell) => cell.points === point)?.description}
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
