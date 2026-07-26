'use client';
import React from 'react';
import {useParams} from "next/navigation";
import {Alert, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {useDiscordBundle} from "@/lib/osmium/hooks/discord";
import DiscordRoleForm from "@/components/Discord/DiscordRoleForm";

export default function Page() {
    const params = useParams<{ roleId: string }>();
    const {data: bundle, isLoading} = useDiscordBundle();

    if (isLoading) {
        return <CircularProgress/>;
    }

    const role = bundle?.roles.find((r) => r.id === params.roleId);
    if (!role) {
        return <Alert severity="error">Role not found.</Alert>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>{role.name}</Typography>
                <DiscordRoleForm discordConfigId={role.discord_config_id} role={role}/>
            </CardContent>
        </Card>
    );
}
