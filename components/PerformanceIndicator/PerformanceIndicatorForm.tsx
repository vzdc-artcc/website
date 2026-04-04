'use client';
import React from 'react';
import {PerformanceIndicatorTemplate} from "@/generated/prisma/browser";
import Form from "next/form";
import {TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {createOrUpdatePerformanceIndicator} from "@/actions/performanceIndicator";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";

export default function PerformanceIndicatorForm({performanceIndicator}: {
    performanceIndicator?: PerformanceIndicatorTemplate
}) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const {errors, performanceIndicator: newPi} = await createOrUpdatePerformanceIndicator(formData);

        if (errors) {
            toast.error(errors.map(e => e.message).join(". "));
            return;
        }

        toast.success("Performance Indicator saved!");
        if (!performanceIndicator) {
            router.push(`/training/indicators/${newPi.id}`);
        }
    }

    return (
        <Form action={handleSubmit}>
            <input type="hidden" name="id" value={performanceIndicator?.id}/>
            <TextField fullWidth variant="filled" name="name" label="Name"
                       defaultValue={performanceIndicator?.name || ''} sx={{mb: 2,}}/>
            <FormSaveButton/>
        </Form>
    );
}