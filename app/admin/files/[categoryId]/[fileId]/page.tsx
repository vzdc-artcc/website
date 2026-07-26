'use client';
import React, {use} from 'react';
import {notFound} from "next/navigation";
import {Card, CardContent, Skeleton, Stack, Typography} from "@mui/material";
import FileForm from "@/components/Files/FileForm";
import Link from "next/link";
import {OpenInNew} from "@mui/icons-material";
import {usePublication} from "@/lib/osmium/hooks/publications";

export default function Page(props: { params: Promise<{ categoryId: string, fileId: string }> }) {
    const {categoryId, fileId} = use(props.params);

    const {data: file, isLoading, error} = usePublication(fileId);

    if (isLoading) {
        return <Card><CardContent><Skeleton height={300}/></CardContent></Card>;
    }
    if (error || !file) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Link href={file.cdn_url} target="_blank" style={{color: 'inherit',}}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 2,}}>
                        <Typography variant="h5">File - {file.title}</Typography>
                        <OpenInNew fontSize="large"/>
                    </Stack>
                </Link>
                <FileForm categoryId={categoryId} publication={file}/>
            </CardContent>
        </Card>
    );
}
