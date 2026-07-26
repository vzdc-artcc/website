'use client';
import React, {use} from 'react';
import {Card, CardContent, Container, Skeleton, Stack, Typography} from "@mui/material";
import FileTable from "@/components/Files/FileTable";
import {usePublicationCategories, usePublications} from "@/lib/osmium/hooks/publications";

export default function Page({searchParams}: { searchParams: Promise<{ ids?: string }> }) {

    const {ids} = use(searchParams);
    const {data: categoriesData, isLoading} = usePublicationCategories();
    const {data: pubsData} = usePublications({ pageSize: 500 });

    const categories = [...(categoriesData ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const publications = pubsData?.items ?? [];

    return (
        <Container maxWidth="lg">
            <Stack direction="column" spacing={2}>
                <Card>
                    <CardContent>
                        <Typography variant="h5">Downloads</Typography>
                    </CardContent>
                </Card>
                {isLoading && <Skeleton height={120}/>}
                {categories.map((category) => {
                    const files = publications
                        .filter((p) => p.category_id === category.id)
                        .sort((a, b) => a.sort_order - b.sort_order);
                    return (
                        <Card key={category.id}>
                            <CardContent>
                                <Typography variant="h6">{category.name}</Typography>
                                <FileTable files={files} ids={ids === 'true'}/>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        </Container>
    );
}
