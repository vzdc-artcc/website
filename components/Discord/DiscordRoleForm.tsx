'use client';
import React from 'react';
import {Grid, TextField} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateDiscordRole, useUpdateDiscordRole} from "@/lib/osmium/hooks/discord";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordRoleForm({role, discordConfigId}: {
    role?: components["schemas"]["DiscordRoleItem"],
    discordConfigId: string
}) {
    const router = useRouter();
    const createRole = useCreateDiscordRole();
    const updateRole = useUpdateDiscordRole();

    const handleSubmit = async (formData: FormData) => {
        const name = (formData.get('name') as string || '').trim();
        const roleId = (formData.get('roleId') as string || '').trim();

        try {
            if (role) {
                await updateRole.mutateAsync({roleId: role.id, body: {name, role_id: roleId}});
            } else {
                await createRole.mutateAsync({discord_config_id: discordConfigId, name, role_id: roleId});
            }
            toast(`Role '${name}' saved successfully!`, {type: 'success'});
            if (!role) {
                router.push(`/website-management/discord/role/new?discordConfigId=${discordConfigId}`);
            }
        } catch {
            toast('Failed to save role.', {type: 'error'});
        }
    };

    return (
        <form action={handleSubmit}>
            <Grid container columns={2} spacing={2}>
                <Grid size={{xs: 2, sm: 1}}>
                    <TextField fullWidth required variant="filled" label="Name" name="name"
                               defaultValue={role?.name}/>
                </Grid>
                <Grid size={{xs: 2, sm: 1}}>
                    <TextField fullWidth required variant="filled" label="Role ID" name="roleId"
                               defaultValue={role?.role_id}/>
                </Grid>
                <Grid size={2}>
                    <FormSaveButton/>
                </Grid>
            </Grid>
        </form>
    );
}
