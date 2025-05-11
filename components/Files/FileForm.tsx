'use client';
import React from 'react';
import {File as DBFile, FileCategory, HighlightColorType} from '@prisma/client';
import {Box, MenuItem, Stack, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {createOrUpdateFile} from "@/actions/files";
import {useRouter} from "next/navigation";

export default function FileForm({ file, category }: { file?: DBFile, category: FileCategory }) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {

        toast('Saving file. This might take a couple seconds.', { type: 'info' });
        const { file, errors } = await createOrUpdateFile(formData);

        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), { type: 'error' });
            return;
        }

        if (!file) {
            router.push(`/admin/files/${category.id}`);
        }
        toast('File saved!', { type: 'success' });

    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="categoryId" value={category.id} />
            <input type="hidden" name="id" value={file?.id} />
            <Stack direction="column" spacing={2}>
                <TextField variant="filled" fullWidth name="name" label="Name" required
                    defaultValue={file?.name || ''} />
                <TextField variant="filled" fullWidth name="alias" label="Alias"
                           defaultValue={file?.alias || ''}
                           helperText="Must be unique or else an error will be thrown."/>
                <TextField variant="filled" fullWidth name="description" label="Description"
                    defaultValue={file?.description || ''} multiline rows={4} />
                <TextField variant="filled" fullWidth name="highlightColor" label="Highlight Color" select defaultValue={file?.highlightColor || ''}>
                    {Object.values(HighlightColorType).map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </TextField>
                <input type="file" name="file" required={!file} />
                <Box>
                    <FormSaveButton />
                </Box>
            </Stack>
        </form>
    );
}