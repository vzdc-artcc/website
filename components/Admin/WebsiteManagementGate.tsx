'use client';
import React from 'react';
import {Grid, Typography} from "@mui/material";
import {useMe} from "@/lib/osmium/hooks/me";
import WebsiteManagementMenu from "@/components/Admin/WebsiteManagementMenu";

export default function WebsiteManagementGate({children}: { children: React.ReactNode }) {
    const {data: me, isLoading} = useMe();

    if (isLoading) {
        return null;
    }

    if (!me?.server_admin) {
        return (
            <Typography variant="h5" textAlign="center">You do not have access to this page.</Typography>
        );
    }

    return (
        <Grid container columns={9} spacing={2}>
            <Grid size={{xs: 9, lg: 2}}>
                <WebsiteManagementMenu displayName={me.display_name}/>
            </Grid>
            <Grid size="grow">
                {children}
            </Grid>
        </Grid>
    );
}
