import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {
    Card,
    CardContent,
    Typography
} from "@mui/material";
import ChannelForm from "@/components/DiscordConfig/ChannelForm";

export default async function Page(props: { params: Promise<{ categoryId: string, }>, }) {
    const params = await props.params;

    const {categoryId} = params;

    const channel = await prisma.discordChannel.findUnique({
        where: {
            id: categoryId,
        },
    });

    if (!channel) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>{channel.name}</Typography>
                <ChannelForm discordConfigId={channel.discordConfigId}/>
            </CardContent>
        </Card>
    );
}