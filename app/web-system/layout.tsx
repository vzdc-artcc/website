import React from 'react';
import {Grid2, Typography} from "@mui/material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import AdminMenu from "@/components/Admin/AdminMenu";
import {Metadata} from "next";
import WebSystemAdminMenu from "@/components/Admin/WebSystemAdminMenu";

export const metadata: Metadata = {
    title: 'Webmaster | vZDC',
    description: 'vZDC web-system page',
};

export default async function Layout({children}: { children: React.ReactNode }) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.some(r => ["WEB_TEAM"].includes(r))) {
        return (
            <Typography variant="h5" textAlign="center">You do not have access to this page.</Typography>
        );
    }

    return (
        (<Grid2 container columns={9} spacing={2}>
            <Grid2
                size={{
                    xs: 9,
                    lg: 2
                }}>
                <WebSystemAdminMenu/>
            </Grid2>
            <Grid2 size="grow">
                {children}
            </Grid2>
        </Grid2>)
    );
}