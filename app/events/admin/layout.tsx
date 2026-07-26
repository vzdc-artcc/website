import React from 'react';
import {Grid} from "@mui/material";
import {Metadata} from "next";
import EventsMenu from '@/components/Admin/EventsMenu';
import RequireRole from "@/components/Access/RequireRole";

export const metadata: Metadata = {
    title: 'Events | vZDC',
    description: 'vZDC events admin page',
};

export default function Layout({children}: { children: React.ReactNode }) {

    return (
        <RequireRole check="isEventStaff">
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
        </RequireRole>
    );
}
