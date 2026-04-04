import React from 'react';
import {Grid, Typography} from "@mui/material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import AdminMenu from "@/components/Admin/AdminMenu";
import {Metadata} from "next";

export const metadata: Metadata = {
    title: 'Admin | vZDC',
    description: 'vZDC admin page',
};

export default async function Layout({children}: { children: React.ReactNode }) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.some(r => ["STAFF"].includes(r))) {
        return (
            <Typography variant="h5" textAlign="center">You do not have access to this page.</Typography>
        );
    }

    return (
        (<Grid container columns={9} spacing={2}>
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
        </Grid>)
    );
}