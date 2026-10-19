import React from 'react';
import prisma from "@/lib/db";
import {notFound} from "next/navigation";
import {Card, CardContent, Stack, Typography} from "@mui/material";
import FileForm from "@/components/Files/FileForm";
import {UTApi} from "uploadthing/server";
import Link from "next/link";
import {OpenInNew} from "@mui/icons-material";

const ut = new UTApi();

export default async function Page(props: { params: Promise<{ categoryId: string, fileId: string, }> }) {
    const params = await props.params;

    const {fileId} = params;

    const file = await prisma.file.findUnique({
        where: {
            id: fileId,
        },
        include: {
            category: true,
        },
    });

    if (!file) {
        notFound();
    }

    const url = (await ut.getFileUrls([file.key])).data[0].url;

    return (
        <Card>
            <CardContent>
                <Link href={url} target="_blank" style={{color: file.highlightColor || 'inherit',}}>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            alignItems: "center",
                            mb: 2
                        }}>
                        <Typography variant="h5" sx={{mb: 2,}}>File - {file.name}</Typography>
                        <OpenInNew fontSize="large"/>
                    </Stack>
                </Link>
                <FileForm file={file} category={file.category}/>
            </CardContent>
        </Card>
    );
}