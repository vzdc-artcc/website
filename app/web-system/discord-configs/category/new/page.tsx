import React from 'react';
import {notFound} from "next/navigation";
import {Card, CardContent, Typography} from "@mui/material";
import prisma from "@/lib/db";
import DiscordCategoryForm from "@/components/DiscordConfig/DiscordCategoryForm";

export default async function Page(props: { searchParams: Promise<{ discordConfigId?: string, }> }) {
    const searchParams = await props.searchParams;

    const {discordConfigId} = searchParams;

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
                <Typography variant="h5">New Category</Typography>
                <Typography variant="subtitle2" sx={{mb: 2,}}>{discordConfig.name}</Typography>
                <DiscordCategoryForm discordConfigId={discordConfig.id}/>
            </CardContent>
        </Card>
    );
}