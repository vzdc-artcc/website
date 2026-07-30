'use client';
import React, {use} from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import FileForm from "@/components/Files/FileForm";

export default function Page(props: { params: Promise<{ categoryId: string }> }) {
    const {categoryId} = use(props.params);

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>New File</Typography>
                <FileForm categoryId={categoryId}/>
            </CardContent>
        </Card>
    );
}
