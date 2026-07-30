import React from 'react';
import {Grid} from "@mui/material";
import {Metadata} from "next";
import EventsMenu from '@/components/Admin/EventsMenu';
import RequirePermission from "@/components/Access/RequirePermission";

export const metadata: Metadata = {
    title: 'Events | vZDC',
    description: 'vZDC events admin page',
};

export default function Layout({children}: { children: React.ReactNode }) {

    return (
        <RequirePermission perm="pages.event_management.read">
            <Grid container columns={9} spacing={2}>
                <Grid
                    size={{
                        xs: 9,
                        lg: 2
                    }}>
                    <EventsMenu />
                </Grid>
                <Grid size="grow">
                    {children}
                </Grid>
            </Grid>
        </RequirePermission>
    );
}
