'use client';
import React from 'react';
import {PerformanceIndicatorCriteriaCategory, PerformanceIndicatorTemplate} from "@/generated/prisma/browser";
import Form from "next/form";
import {TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdatePerformanceIndicatorCategory} from "@/actions/performanceIndicatorCategory";
import {toast} from "react-toastify";

export default function PerformanceIndicatorCategoryForm({template, category, onUpdate}: {
    template: PerformanceIndicatorTemplate,
    category?: PerformanceIndicatorCriteriaCategory,
    onUpdate?: () => void
}) {

    const handleSubmit = async (formData: FormData) => {
        const {errors, pic} = await createOrUpdatePerformanceIndicatorCategory(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join('. '));
            return;
        }

        if (category) {
            toast.success(`Category ${pic.name} updated`);
            onUpdate && onUpdate();
        } else {
            toast.success(`Category ${pic.name} created`);
        }
    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" name="templateId" value={template.id}/>
            <input type="hidden" name="id" value={category?.id}/>
            <TextField fullWidth variant="filled" name="name" label="Name" defaultValue={category?.name || ''}
                       sx={{mb: 2,}}/>
            <FormSaveButton/>
        </Form>
    );

}