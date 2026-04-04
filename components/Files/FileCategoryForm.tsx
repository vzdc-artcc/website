'use client';
import React from 'react';
import {FileCategory} from "@/generated/prisma/browser";
import {TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {createOrUpdateFileCategory} from "@/actions/files";

export default function FileCategoryForm({fileCategory}: { fileCategory?: FileCategory }) {

    const handleSubmit = async (formData: FormData) => {

        const {fileCategory, errors} = await createOrUpdateFileCategory(formData);

        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'})
            return;
        }

        toast(`File category ${fileCategory.name} saved successfully!`, {type: 'success'});
    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="id" value={fileCategory?.id || ''}/>
            <TextField fullWidth required variant="filled" name="name" label="Name"
                       defaultValue={fileCategory?.name || ''} sx={{mb: 1,}}/>
            <FormSaveButton/>
        </form>
    );

}