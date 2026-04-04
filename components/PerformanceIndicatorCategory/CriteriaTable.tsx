import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {PerformanceIndicatorCriteria, PerformanceIndicatorCriteriaCategory} from "@/generated/prisma/browser";
import PerformanceIndicatorCriteriaDialogForm
    from "@/components/PerformanceIndicatorCriteria/PerformanceIndicatorCriteriaDialogForm";
import PerformanceIndicatorCriteriaDeleteButton
    from "@/components/PerformanceIndicatorCriteria/PerformanceIndicatorCriteriaDeleteButton";

export default async function CriteriaTable({criteria, category}: {
    criteria: PerformanceIndicatorCriteria[],
    category: PerformanceIndicatorCriteriaCategory
}) {

    if (criteria.length === 0) {
        return <Typography>No criteria for this category.</Typography>
    }

    return (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {criteria.map((c) => (
                        <TableRow key={c.id}>
                            <TableCell>{c.name}</TableCell>
                            <TableCell>
                                <PerformanceIndicatorCriteriaDialogForm category={category} criteria={c}/>
                                <PerformanceIndicatorCriteriaDeleteButton criteria={c}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}