import React from 'react';
import {Grid, Typography} from "@mui/material";
import {Metadata} from "next";
import FileManager from "@/components/Admin/FileManager";

export const metadata: Metadata = {
    title: 'Files | vZDC',
    description: 'vZDC CDN file manager',
};

export default function Page() {
    return (
        <Grid container columns={12} spacing={2}>
            <Grid size={12}>
                <Typography variant="h5" fontWeight={700}>Files</Typography>
                <Typography color="text.secondary">
                    Upload, browse, and manage files served from the vZDC CDN.
                </Typography>
            </Grid>
            <Grid size={12}>
                <FileManager/>
            </Grid>
        </Grid>
    );
}
