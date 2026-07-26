'use client';
import React, {use} from 'react';
import {Card, CardContent, Skeleton, Stack, Typography} from "@mui/material";
import {notFound} from "next/navigation";
import FileCategoryForm from "@/components/Files/FileCategoryForm";
import FileTable from "@/components/Files/FileTable";
import FileForm from "@/components/Files/FileForm";
import {useAdminPublicationCategories, useAdminPublications} from "@/lib/osmium/hooks/publications";

export default function Page(props: { params: Promise<{ categoryId: string }> }) {
    const {categoryId} = use(props.params);

    const {data: categoriesData, isLoading} = useAdminPublicationCategories();
    const {data: pubsData} = useAdminPublications();

    const category = categoriesData?.find((c) => c.id === categoryId);
    if (!isLoading && categoriesData && !category) {
        notFound();
    }
    if (isLoading || !category) {
        return <Card><CardContent><Skeleton height={200}/></CardContent></Card>;
    }

    const files = (pubsData?.items ?? [])
        .filter((p) => p.category_id === categoryId)
        .sort((a, b) => a.sort_order - b.sort_order);

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">File Category - {category.name}</Typography>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>Edit Category</Typography>
                    <FileCategoryForm fileCategory={category}/>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>Files</Typography>
                    <FileTable files={files} admin/>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>New File</Typography>
                    <FileForm categoryId={categoryId}/>
                </CardContent>
            </Card>
        </Stack>
    );
}
