import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {
    Card,
    CardContent,
    Typography
} from "@mui/material";
import DiscordRoleForm from "@/components/DiscordConfig/DiscordRoleForm";

export default async function Page(props: { params: Promise<{ roleId: string, }>, }) {
    const params = await props.params;

    const {roleId} = params;

    const role = await prisma.discordRole.findUnique({
        where: {
            id: roleId,
        },
    });

    if (!role) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>{role.name}</Typography>
                <DiscordRoleForm discordConfigId={role.discordConfigId}/>
            </CardContent>
        </Card>
    );
}