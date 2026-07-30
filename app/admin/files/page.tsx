'use client';
import React from 'react';
import {Box, Button, Card, CardContent, IconButton, Skeleton, Stack, Typography} from "@mui/material";
import FileCategoryForm from "@/components/Files/FileCategoryForm";
import Link from "next/link";
import {CloudUpload, Edit, Reorder} from "@mui/icons-material";
import FileCategoryDeleteButton from "@/components/Files/FileCategoryDeleteButton";
import FileTable from "@/components/Files/FileTable";
import {useAdminPublicationCategories, useAdminPublications} from "@/lib/osmium/hooks/publications";

export default function Page() {

    const {data: categoriesData, isLoading} = useAdminPublicationCategories();
    const {data: pubsData} = useAdminPublications();

    const categories = [...(categoriesData ?? [])].sort((a, b) => a.sort_order - b.sort_order);
    const publications = pubsData?.items ?? [];

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Stack direction={{xs: 'column', md: 'row',}} justifyContent="space-between">
                        <Typography variant="h5">File Center</Typography>
                        <Link href="/admin/files/order" style={{color: 'inherit',}}>
                            <Button variant="outlined" color="inherit" size="small" startIcon={<Reorder/>}
                                    sx={{mr: 1,}}>Order</Button>
                        </Link>
                    </Stack>
                </CardContent>
            </Card>
            {isLoading && <Skeleton height={120}/>}
            {categories.map((category) => (
                <Card key={category.id}>
                    <CardContent>
                        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{mb: 1,}}>
                            <Typography variant="h6">{category.name}</Typography>
                            <Box>
                                <Link href={`/admin/files/${category.id}/order`} style={{color: 'inherit',}}>
                                    <IconButton><Reorder/></IconButton>
                                </Link>
                                <Link href={`/admin/files/${category.id}/new`}>
                                    <IconButton><CloudUpload/></IconButton>
                                </Link>
                                <Link href={`/admin/files/${category.id}`} style={{color: 'inherit',}}>
                                    <IconButton><Edit/></IconButton>
                                </Link>
                                <FileCategoryDeleteButton fileCategory={category}/>
                            </Box>
                        </Stack>
                        <FileTable
                            files={publications.filter((p) => p.category_id === category.id)
                                .sort((a, b) => a.sort_order - b.sort_order)}
                            admin/>
                    </CardContent>
                </Card>
            ))}
            <Card>
                <CardContent>
                    <Typography variant="h6" sx={{mb: 1,}}>New File Category</Typography>
                    <FileCategoryForm/>
                </CardContent>
            </Card>
        </Stack>
    );
}
