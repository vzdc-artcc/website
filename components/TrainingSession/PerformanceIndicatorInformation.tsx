import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import PerformanceIndicatorCommentDialog from "@/components/TrainingSession/PerformanceIndicatorCommentDialog";

interface CriterionLike {
    id: string;
    name: string;
    marker?: string | null;
    comments?: string | null;
}

interface CategoryLike {
    id: string;
    name: string;
    criteria: CriterionLike[];
}

export default function PerformanceIndicatorInformation({performanceIndicator}: {
    performanceIndicator: { categories: CategoryLike[] }
}) {
    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell>Criteria</TableCell>
                        <TableCell sx={{textAlign: 'center',}}>Observed</TableCell>
                        <TableCell sx={{textAlign: 'center',}}>Not Observed</TableCell>
                        <TableCell sx={{textAlign: 'center',}}>Comment</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {performanceIndicator.categories.map((category) => {
                        const {criteria} = category;

                        return criteria.map((criterion, index) => (
                            <TableRow key={criterion.id}>
                                {index === 0 && <TableCell rowSpan={criteria.length}>{category.name}</TableCell>}
                                <TableCell sx={{height: 40,}}>{criterion.name}</TableCell>
                                <TableCell sx={{
                                    border: 1,
                                    background: criterion.marker === 'OBSERVED' ? 'rgba(69,129,255,0.44)' : 'inherit',
                                }}></TableCell>
                                <TableCell sx={{
                                    border: 1,
                                    background: criterion.marker === 'NOT_OBSERVED' ? 'rgba(200,0,255,0.2)' : 'inherit',
                                }}></TableCell>
                                <TableCell sx={{
                                    border: 1,
                                    textAlign: 'center',
                                }}>
                                    {criterion.comments &&
                                        <PerformanceIndicatorCommentDialog criteria={criterion}/>
                                    }
                                </TableCell>
                            </TableRow>
                        ));
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
