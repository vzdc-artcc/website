import React from 'react';
import {Box, Card, CardContent, Stack, Typography} from "@mui/material";
import CidForm from "@/components/Form/CidForm";
import prisma from "@/lib/db";
import {User} from "next-auth";

export default async function Layout({children}: { children: React.ReactNode, }) {

    const controllers = await prisma.user.findMany({
        where: {
            controllerStatus: {
                not: 'NONE',
            },
        },
    });

    return (
        <Stack direction="column" spacing={2}>
            <Card>
                <CardContent>
                    <Typography variant="h5">Event Controller Statistics</Typography>
                    <Box sx={{my: 2,}}>
                        <CidForm basePath="/events/admin/controller" controllers={controllers as User[]}/>
                    </Box>
                </CardContent>
            </Card>
            <Box>
                {children}
            </Box>
        </Stack>
    );
}