'use client';
import React, {useState} from 'react';
import {Add, Edit} from "@mui/icons-material";
import {Dialog, DialogContent, DialogTitle, IconButton, TextField} from "@mui/material";
import Form from "next/form";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {
    useCreatePerformanceIndicatorCriteria,
    usePerformanceIndicatorCriteria,
    useUpdatePerformanceIndicatorCriteria
} from "@/lib/osmium/hooks/training";

export default function PerformanceIndicatorCriteriaDialogForm({category, criteria,}: {
    category: { id: string },
    criteria?: { id: string, name: string, sort_order: number },
}) {

    const [open, setOpen] = useState(false);
    const {data} = usePerformanceIndicatorCriteria();
    const createCriteria = useCreatePerformanceIndicatorCriteria();
    const updateCriteria = useUpdatePerformanceIndicatorCriteria();

    const handleSubmit = async (formData: FormData) => {
        const name = formData.get('name') as string;

        try {
            if (criteria) {
                await updateCriteria.mutateAsync({criteriaId: criteria.id, body: {name}});
            } else {
                const existingForCategory = (data?.items ?? []).filter((c) => c.category_id === category.id);
                const nextOrder = existingForCategory.length > 0
                    ? Math.max(...existingForCategory.map((c) => c.sort_order)) + 1
                    : 1;
                await createCriteria.mutateAsync({category_id: category.id, name, sort_order: nextOrder});
            }
            toast.success(`Performance indicator criteria ${name} saved.`);
            setOpen(false);
        } catch {
            toast.error("Failed to save criteria.");
        }
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
                        <TextField fullWidth variant="filled" name="name" label="Name"
                                   defaultValue={criteria?.name || ''} sx={{mb: 2,}}/>
                        <FormSaveButton/>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
