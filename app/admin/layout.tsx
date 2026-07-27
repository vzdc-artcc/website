import React from 'react';
import {Grid} from "@mui/material";
import AdminMenu from "@/components/Admin/AdminMenu";
import {Metadata} from "next";
import RequirePermission from "@/components/Access/RequirePermission";

export const metadata: Metadata = {
    title: 'Admin | vZDC',
    description: 'vZDC admin page',
};

export default function Layout({children}: { children: React.ReactNode }) {

    return (
        <RequirePermission perm="pages.facility_admin.read">
            <Grid container columns={9} spacing={2}>
                <Grid
                    size={{
                        xs: 9,
                        lg: 2
                    }}>
                    <AdminMenu/>
                </Grid>
                <Grid size="grow">
                    {children}
                </Grid>
            </Grid>
        </RequirePermission>
    );
}
