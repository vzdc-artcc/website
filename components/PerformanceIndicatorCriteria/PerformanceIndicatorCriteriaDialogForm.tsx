'use client';
import React, {useState} from 'react';
import {PerformanceIndicatorCriteria, PerformanceIndicatorCriteriaCategory} from "@/generated/prisma/browser";
import {Add, Edit} from "@mui/icons-material";
import {Dialog, DialogContent, DialogTitle, IconButton, TextField} from "@mui/material";
import Form from "next/form";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdateCriteria} from "@/actions/performanceIndicatorCriteria";
import {toast} from "react-toastify";

export default function PerformanceIndicatorCriteriaDialogForm({category, criteria,}: {
    category: PerformanceIndicatorCriteriaCategory,
    criteria?: PerformanceIndicatorCriteria,
}) {

    const [open, setOpen] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        const {errors, criteria} = await createOrUpdateCriteria(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join(". "));
            return;
        }

        toast.success(`Performance indicator criteria ${criteria.name} saved.`);
        setOpen(false);
    }

    return (
        <>
            <IconButton onClick={() => setOpen(true)}>
                {criteria ? <Edit/> : <Add/>}
            </IconButton>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Performance Indicator Criteria</DialogTitle>
                <DialogContent>
                    <Form action={handleSubmit}>
                        <input type="hidden" name="categoryId" value={category.id}/>
                        <input type="hidden" name="id" value={criteria?.id}/>
                        <TextField fullWidth variant="filled" name="name" label="Name"
                                   defaultValue={criteria?.name || ''} sx={{mb: 2,}}/>
                        <FormSaveButton/>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}