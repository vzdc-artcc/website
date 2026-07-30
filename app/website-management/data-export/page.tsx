import React from 'react';
import {Grid, Typography} from "@mui/material";
import {Metadata} from "next";
import RosterDataExportCard from "@/components/Admin/RosterDataExportCard";

export const metadata: Metadata = {
    title: 'Data Export | vZDC',
    description: 'vZDC roster data export',
};

export default function Page() {
    return (
        <Grid container columns={12} spacing={2}>
            <Grid size={12}>
                <Typography variant="h5" fontWeight={700}>Data Export</Typography>
                <Typography color="text.secondary">
                    Bulk export of on-roster controllers&apos; personal data for compliance.
                </Typography>
            </Grid>
            <Grid size={12}>
                <RosterDataExportCard/>
            </Grid>
        </Grid>
    );
}
