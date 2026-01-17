'use client';
import React from 'react';
import {DiscordCategory, DiscordRole} from "@prisma/client";
import {Grid2, TextField,} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {upsertCategory, upsertRole} from "@/actions/discordConfig";


export default function DiscordCategoryForm({category, discordConfigId}: { category?: DiscordCategory, discordConfigId: string, }) {

    const router = useRouter();
    const handleSubmit = async (formData: FormData) => {

        const {category: savedCategory, errors} = await upsertCategory(formData);
        if (errors) {
            toast(errors.map(e => e.message).join(".  "), {type: 'error'});
            return;
        }

        toast(`Category '${savedCategory.name}' saved successfully!`, {type: 'success'});

        if (!category) {
            router.push(`/web-system/discord-configs/category/new?discordConfigId=${discordConfigId}`);
        }
    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="discordConfigId" value={discordConfigId} />
            <input type="hidden" name="id" value={category?.id}/>
            <Grid2 container columns={2} spacing={2}>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="Name" name="name" defaultValue={category?.name || ''}/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="Category ID" name="categoryId" defaultValue={category?.categoryId || ''}/>
                </Grid2>
                <Grid2 size={2}>
                    <FormSaveButton />
                </Grid2>
            </Grid2>
        </form>)
    );

}