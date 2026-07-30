'use client';
import React from 'react';
import Form from "next/form";
import {TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useCreatePerformanceIndicatorTemplate, useUpdatePerformanceIndicatorTemplate} from "@/lib/osmium/hooks/training";

export default function PerformanceIndicatorForm({performanceIndicator}: {
    performanceIndicator?: { id: string, name: string }
}) {

    const router = useRouter();
    const createTemplate = useCreatePerformanceIndicatorTemplate();
    const updateTemplate = useUpdatePerformanceIndicatorTemplate();

    const handleSubmit = async (formData: FormData) => {
        const name = formData.get('name') as string;

        try {
            if (performanceIndicator) {
                await updateTemplate.mutateAsync({templateId: performanceIndicator.id, body: {name}});
                toast.success("Performance Indicator saved!");
            } else {
                const created = await createTemplate.mutateAsync({name});
                toast.success("Performance Indicator saved!");
                router.push(`/training/indicators/${created!.id}`);
            }
        } catch {
            toast.error("Failed to save Performance Indicator.");
        }
    }

    return (
        <Form action={handleSubmit}>
            <TextField fullWidth variant="filled" name="name" label="Name"
                       defaultValue={performanceIndicator?.name || ''} sx={{mb: 2,}}/>
            <FormSaveButton/>
        </Form>
    );
}
