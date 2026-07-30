import React from 'react';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import PerformanceIndicatorCriteriaDialogForm
    from "@/components/PerformanceIndicatorCriteria/PerformanceIndicatorCriteriaDialogForm";
import PerformanceIndicatorCriteriaDeleteButton
    from "@/components/PerformanceIndicatorCriteria/PerformanceIndicatorCriteriaDeleteButton";

export default function CriteriaTable({criteria, category}: {
    criteria: { id: string, name: string, sort_order: number }[],
    category: { id: string, name: string, sort_order: number }
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
