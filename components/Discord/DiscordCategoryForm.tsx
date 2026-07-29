'use client';
import React from 'react';
import {Grid, TextField} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateDiscordCategory, useUpdateDiscordCategory} from "@/lib/osmium/hooks/discord";
import DiscordResourceSelect from "@/components/Discord/DiscordResourceSelect";
import {useGuildResourceOptions} from "@/components/Discord/useGuildResourceOptions";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordCategoryForm({category, discordConfigId, guildId}: {
    category?: components["schemas"]["DiscordCategoryItem"],
    discordConfigId: string,
    guildId?: string | null,
}) {
    const router = useRouter();
    const createCategory = useCreateDiscordCategory();
    const updateCategory = useUpdateDiscordCategory();
    const {options: categoryOptions, loading: discoveryLoading, helperText} = useGuildResourceOptions('category', guildId);

    const handleSubmit = async (formData: FormData) => {
        const name = (formData.get('name') as string || '').trim();
        const categoryId = (formData.get('categoryId') as string || '').trim();

        try {
            if (category) {
                await updateCategory.mutateAsync({categoryId: category.id, body: {name, category_id: categoryId}});
            } else {
                await createCategory.mutateAsync({discord_config_id: discordConfigId, name, category_id: categoryId});
            }
            toast(`Category '${name}' saved successfully!`, {type: 'success'});
            if (!category) {
                router.push(`/website-management/discord/category/new?discordConfigId=${discordConfigId}`);
            }
        } catch {
            toast('Failed to save category.', {type: 'error'});
        }
    };

    return (
        <form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid size={{xs: 2, sm: 1}}>
                    <TextField fullWidth required variant="filled" label="Name" name="name"
                               defaultValue={category?.name || ''}/>
                </Grid>
                <Grid size={{xs: 2, sm: 1}}>
                    <DiscordResourceSelect
                        name="categoryId"
                        label="Category"
                        required
                        options={categoryOptions}
                        defaultId={category?.category_id}
                        loading={discoveryLoading}
                        helperText={helperText}
                    />
                </Grid>
                <Grid size={2}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>
    );
}
