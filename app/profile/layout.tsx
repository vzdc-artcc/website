import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Box, Typography} from "@mui/material";
import {Metadata} from "next";
import BroadcastViewer from "@/components/BroadcastViewer/BroadcastViewer";

export const metadata: Metadata = {
    title: 'Profile | vZDC',
    description: 'vZDC profile page',
};

export default async function Layout({children}: { children: React.ReactNode }) {

    const session = await getServerSession(authOptions);

    if (!session) {
        return (
            <Typography variant="h5" sx={{
                textAlign: "center"
            }}>You must login to view this page.</Typography>
        );
    }

    if (session.user.roles.length === 0) {
        return (
            <Box>
                <Typography variant="h5" sx={{
                    textAlign: "center"
                }}>You must be a controller to access this
                    page.</Typography>
            </Box>
        );
    }

    return (
        <>
            <BroadcastViewer user={session.user} includeSeen/>
            {children}
        </>
    );
}