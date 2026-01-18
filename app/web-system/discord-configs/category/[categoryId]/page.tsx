import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {
    Card,
    CardContent,
    Typography
} from "@mui/material";
import DiscordCategoryForm from "@/components/DiscordConfig/DiscordCategoryForm";

export default async function Page(props: { params: Promise<{ categoryId: string, }>, }) {
    const params = await props.params;

    const {categoryId} = params;

    const category = await prisma.discordCategory.findUnique({
        where: {
            id: categoryId,
        },
    });

    if (!category) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>{category.name}</Typography>
                <DiscordCategoryForm discordConfigId={category.discordConfigId} category={category}/>
            </CardContent>
        </Card>
    );
}