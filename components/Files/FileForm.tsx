'use client';
import React from 'react';
import {Box, MenuItem, Stack, TextField} from "@mui/material";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import {useUploadFile} from "@/lib/osmium/hooks/files";
import {Publication, useCreatePublication, useUpdatePublication} from "@/lib/osmium/hooks/publications";

const STATUSES = ['draft', 'published', 'archived'] as const;

export default function FileForm({categoryId, publication}: { categoryId: string, publication?: Publication }) {

    const router = useRouter();
    const upload = useUploadFile();
    const create = useCreatePublication();
    const update = useUpdatePublication();

    const [title, setTitle] = React.useState(publication?.title ?? '');
    const [description, setDescription] = React.useState(publication?.description ?? '');
    const [status, setStatus] = React.useState<string>(publication?.status ?? 'published');
    const [file, setFile] = React.useState<File | null>(null);

    const handleSubmit = async () => {
        if (!title.trim()) { toast.error('Name is required.'); return; }
        if (!publication && !file) { toast.error('A file is required.'); return; }
        toast('Saving file. This might take a couple seconds.', {type: 'info'});
        try {
            let fileId = publication?.file_id;
            if (file) {
                const uploaded = await upload.mutateAsync({file, public: true});
                fileId = uploaded.id;
            }
            const body = {
                category_id: categoryId,
                title,
                description: description || null,
                effective_at: publication?.effective_at ?? new Date().toISOString(),
                file_id: fileId!,
                is_public: publication?.is_public ?? true,
                sort_order: publication?.sort_order ?? 0,
                status: status as "draft" | "published" | "archived",
            };
            if (publication) {
                await update.mutateAsync({publicationId: publication.id, body});
            } else {
                await create.mutateAsync(body);
                router.push(`/admin/files/${categoryId}`);
            }
            toast('File saved!', {type: 'success'});
        } catch {
            toast.error('Failed to save file.');
        }
    }

    return (
        <form action={handleSubmit}>
            <Stack direction="column" spacing={2}>
                <TextField variant="filled" fullWidth label="Name" required value={title}
                           onChange={(e) => setTitle(e.target.value)}/>
                <TextField variant="filled" fullWidth label="Description" multiline rows={4} value={description}
                           onChange={(e) => setDescription(e.target.value)}/>
                <TextField variant="filled" fullWidth label="Status" select value={status}
                           onChange={(e) => setStatus(e.target.value)}>
                    {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} required={!publication}/>
                <Box>
                    <FormSaveButton/>
                </Box>
            </Stack>
        </form>
    );
}
