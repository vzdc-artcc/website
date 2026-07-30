'use client';
import React, {use, useEffect} from 'react';
import {notFound} from "next/navigation";
import {Card, CardContent, IconButton, Skeleton, Typography} from "@mui/material";
import {OpenInNew} from "@mui/icons-material";
import Link from "next/link";
import {usePublication} from "@/lib/osmium/hooks/publications";

export default function Page(props: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ fileOnly?: string }>,
}) {

    const {id} = use(props.params);
    const {fileOnly} = use(props.searchParams);
    const {data: file, isLoading, error} = usePublication(id);

    useEffect(() => {
        if (fileOnly === 'true' && file?.cdn_url) {
            window.location.replace(file.cdn_url);
        }
    }, [fileOnly, file?.cdn_url]);

    if (isLoading) {
        return <Card><CardContent><Skeleton height={400}/></CardContent></Card>;
    }

    if (error || !file) {
        notFound();
    }

    return (
        <Card>
            <CardContent>
                <Link href={file.cdn_url} style={{textDecoration: 'none', color: 'inherit',}} target="_blank">
                    <Typography variant="h4" sx={{mb: 1,}}>{file.title}
                        <IconButton size="large">
                            <OpenInNew fontSize="large"/>
                        </IconButton>
                    </Typography>
                </Link>
                <iframe src={file.cdn_url} style={{width: '100%', height: '100vh', border: 'none',}}/>
            </CardContent>
        </Card>
    );
}
