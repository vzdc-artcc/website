'use client';
import React from 'react';
import {TraconGroup} from "@/generated/prisma/browser";
import {Stack, TextField} from "@mui/material";
import {toast} from "react-toastify";
import {upsertTraconGroup} from "@/actions/airports";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";

export default function TraconGroupForm({traconGroup}: { traconGroup?: TraconGroup }) {

    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {

        const {traconGroup: savedTraconGroup, errors} = await upsertTraconGroup(formData);
        if (errors) {
            toast(errors.map((e) => e.message).join(".  "), {type: 'error'});
            return;
        }
        toast(`Tracon group '${savedTraconGroup.name}' saved successfully!`, {type: 'success'});

        if (!traconGroup) {
            const query = new URLSearchParams();
            query.append('traconGroupId', savedTraconGroup.id);
            router.push(`/admin/airports/airport/new?${query.toString()}`)
        }
    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="id" value={traconGroup?.id}/>
            <Stack direction="column" spacing={2}>
                <TextField fullWidth variant="filled" label="Name*" name="name" defaultValue={traconGroup?.name || ''}/>
                <FormSaveButton />
            </Stack>
        </form>
    );
}