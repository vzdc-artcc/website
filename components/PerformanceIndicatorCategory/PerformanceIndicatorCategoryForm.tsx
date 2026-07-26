'use client';
import React from 'react';
import Form from "next/form";
import {TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {
    useCreatePerformanceIndicatorCategory,
    usePerformanceIndicatorCategories,
    useUpdatePerformanceIndicatorCategory
} from "@/lib/osmium/hooks/training";

export default function PerformanceIndicatorCategoryForm({template, category, onUpdate}: {
    template: { id: string },
    category?: { id: string, name: string, sort_order: number },
    onUpdate?: () => void
}) {

    const {data} = usePerformanceIndicatorCategories();
    const createCategory = useCreatePerformanceIndicatorCategory();
    const updateCategory = useUpdatePerformanceIndicatorCategory();

    const handleSubmit = async (formData: FormData) => {
        const name = formData.get('name') as string;

        try {
            if (category) {
                await updateCategory.mutateAsync({categoryId: category.id, body: {name}});
                toast.success(`Category ${name} updated`);
                onUpdate && onUpdate();
            } else {
                const existingForTemplate = (data?.items ?? []).filter((c) => c.template_id === template.id);
                const nextOrder = existingForTemplate.length > 0
                    ? Math.max(...existingForTemplate.map((c) => c.sort_order)) + 1
                    : 1;
                await createCategory.mutateAsync({template_id: template.id, name, sort_order: nextOrder});
                toast.success(`Category ${name} created`);
            }
        } catch {
            toast.error("Failed to save category.");
        }
    }

    return (
        <Form action={handleSubmit}>
            <TextField fullWidth variant="filled" name="name" label="Name" defaultValue={category?.name || ''}
                       sx={{mb: 2,}}/>
            <FormSaveButton/>
        </Form>
    );

}
