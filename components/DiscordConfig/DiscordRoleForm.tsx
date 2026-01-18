'use client';
import React from 'react';
import {DiscordRole} from "@prisma/client";
import {Grid2, TextField,} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {upsertRole} from "@/actions/discordConfig";


export default function DiscordRoleForm({role, discordConfigId}: { role?: DiscordRole, discordConfigId: string, }) {

    const router = useRouter();
    const handleSubmit = async (formData: FormData) => {

        const {role: savedRole, errors} = await upsertRole(formData);
        if (errors) {
            toast(errors.map(e => e.message).join(".  "), {type: 'error'});
            return;
        }

        toast(`Role '${savedRole.name}' saved successfully!`, {type: 'success'});

        if (!role) {
            router.push(`/web-system/discord-configs/role/new?discordConfigId=${discordConfigId}`);
        }
    }

    return (
        (<form action={handleSubmit}>
            <input type="hidden" name="discordConfigId" value={discordConfigId} />
            <input type="hidden" name="id" value={role?.id}/>
            <Grid2 container columns={2} spacing={2}>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="Name" name="name" defaultValue={role?.name}/>
                </Grid2>
                <Grid2
                    size={{
                        xs: 2,
                        sm: 1
                    }}>
                    <TextField fullWidth variant="filled" label="Role ID" name="roleId" defaultValue={role?.roleId}/>
                </Grid2>
                <Grid2 size={2}>
                    <FormSaveButton />
                </Grid2>
            </Grid2>
        </form>)
    );

}