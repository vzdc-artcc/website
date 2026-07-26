'use client';
import React from 'react';
import {TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {
    PublicationCategory,
    useCreatePublicationCategory,
    useUpdatePublicationCategory,
} from "@/lib/osmium/hooks/publications";

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function FileCategoryForm({fileCategory}: { fileCategory?: PublicationCategory }) {

    const create = useCreatePublicationCategory();
    const update = useUpdatePublicationCategory();
    const [name, setName] = React.useState(fileCategory?.name ?? '');
    const [key, setKey] = React.useState(fileCategory?.key ?? '');

    const handleSubmit = async () => {
        if (!name.trim()) { toast.error('Name is required.'); return; }
        const finalKey = slugify(key || name);
        try {
            if (fileCategory) {
                await update.mutateAsync({
                    categoryId: fileCategory.id,
                    body: {key: finalKey, name, description: fileCategory.description ?? null, sort_order: fileCategory.sort_order},
                });
            } else {
                await create.mutateAsync({key: finalKey, name});
            }
            toast(`File category ${name} saved successfully!`, {type: 'success'});
        } catch {
            toast.error('Failed to save category (the key may already be in use).');
        }
    }

    return (
        <form action={handleSubmit}>
            <TextField fullWidth required variant="filled" label="Name" value={name}
                       onChange={(e) => setName(e.target.value)} sx={{mb: 1,}}/>
            <TextField fullWidth variant="filled" label="Key (URL slug)" value={key}
                       onChange={(e) => setKey(e.target.value)} sx={{mb: 1,}}
                       helperText="Unique identifier; auto-derived from the name if left blank."/>
            <FormSaveButton/>
        </form>
    );
}
