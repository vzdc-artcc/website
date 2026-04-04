'use client';
import React, {useState} from 'react';
import {PerformanceIndicatorCriteriaCategory, PerformanceIndicatorTemplate} from "@/generated/prisma/browser";
import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Edit} from "@mui/icons-material";
import PerformanceIndicatorCategoryForm
    from "@/components/PerformanceIndicatorCategory/PerformanceIndicatorCategoryForm";

export default function PerformanceIndicatorCategoryEditButton({template, category,}: {
    template: PerformanceIndicatorTemplate,
    category: PerformanceIndicatorCriteriaCategory
}) {

    const [open, setOpen] = useState(false);

    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                <Edit/>
            </IconButton>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Edit category - {category.name}</DialogTitle>
                <DialogContent>
                    <PerformanceIndicatorCategoryForm template={template} category={category}
                                                      onUpdate={() => setOpen(false)}/>
                </DialogContent>
            </Dialog>
        </>
    );
}