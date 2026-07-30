'use client';
import React from 'react';
import {Grid} from "@mui/material";
import {toast} from "react-toastify";
import {useRouter} from "next/navigation";
import FormSaveButton from "@/components/Form/FormSaveButton";
import {useCreateDiscordRole, useUpdateDiscordRole} from "@/lib/osmium/hooks/discord";
import DiscordResourceSelect from "@/components/Discord/DiscordResourceSelect";
import DiscordNameSelect from "@/components/Discord/DiscordNameSelect";
import {useGuildResourceOptions} from "@/components/Discord/useGuildResourceOptions";
import {KNOWN_DISCORD_ROLE_NAME_PREFIXES} from "@/components/Discord/knownNames";
import type {components} from "@/lib/osmium/generated/schema";

export default function DiscordRoleForm({role, discordConfigId, guildId}: {
    role?: components["schemas"]["DiscordRoleItem"],
    discordConfigId: string,
    guildId?: string | null,
}) {
    const router = useRouter();
    const createRole = useCreateDiscordRole();
    const updateRole = useUpdateDiscordRole();
    const {options: roleOptions, loading: discoveryLoading, helperText} = useGuildResourceOptions('role', guildId);

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
                    <DiscordNameSelect
                        name="name"
                        label="Name"
                        required
                        options={KNOWN_DISCORD_ROLE_NAME_PREFIXES}
                        defaultValue={role?.name}
                        helperText="Start from a known prefix (e.g. impromptu_s1), or type your own."
                    />
                </Grid>
                <Grid size={{xs: 2, sm: 1}}>
                    <DiscordResourceSelect
                        name="roleId"
                        label="Role"
                        required
                        options={roleOptions}
                        defaultId={role?.role_id}
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
