import React from 'react';
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import {Card, CardContent, Stack, Typography} from "@mui/material";
import {Info} from "@mui/icons-material";

export default async function Layout({children}: { children: React.ReactNode }) {

    const session = await getServerSession(authOptions);

    if (!session || !session.user.roles.includes("STAFF")) {
        return (
            <Card>
                <CardContent>
                    <Stack direction="row" spacing={1} sx={{
                        alignItems: "center"
                    }}>
                        <Info color="error"/>
                        <Typography>You do not have access to this page.</Typography>
                    </Stack>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {children}
        </>
    );
}