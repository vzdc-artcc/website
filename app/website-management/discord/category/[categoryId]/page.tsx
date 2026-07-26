'use client';
import React from 'react';
import {useParams} from "next/navigation";
import {Alert, Card, CardContent, CircularProgress, Typography} from "@mui/material";
import {useDiscordBundle} from "@/lib/osmium/hooks/discord";
import DiscordCategoryForm from "@/components/Discord/DiscordCategoryForm";

export default function Page() {
    const params = useParams<{ categoryId: string }>();
    const {data: bundle, isLoading} = useDiscordBundle();

    if (isLoading) {
        return <CircularProgress/>;
    }

    const category = bundle?.categories.find((c) => c.id === params.categoryId);
    if (!category) {
        return <Alert severity="error">Category not found.</Alert>;
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>{category.name}</Typography>
                <DiscordCategoryForm discordConfigId={category.discord_config_id} category={category}/>
            </CardContent>
        </Card>
    );
}
