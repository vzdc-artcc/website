import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Card, CardContent, Typography} from "@mui/material";
import TraconGroupForm from "@/components/Airports/TraconGroupForm";
import DiscordConfigForm from "@/components/DiscordConfig/DiscordConfigForm";

export default async function Page(props: { params: Promise<{ discordConfigId: string, }>, }) {
    const params = await props.params;

    const {discordConfigId} = params;
    const discordConfig = await prisma.discordConfig.findUnique({
        where: {
            id: discordConfigId,
        },
    });

    if (!discordConfig) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>Edit Discord Config</Typography>
                <DiscordConfigForm discordConfig={discordConfig}/>
            </CardContent>
        </Card>
    );
}