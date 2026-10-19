import React from 'react';
import {Card, CardContent, Typography} from "@mui/material";
import prisma from "@/lib/db";
import UserDataExportForm from "@/components/UserDataExport/UserDataExportForm";

export default async function Page() {

    // every user that has ever signed in, not just the roster
    const users = await prisma.user.findMany({
        select: {
            cid: true,
            firstName: true,
            lastName: true,
            controllerStatus: true,
        },
        orderBy: [{lastName: 'asc'}, {firstName: 'asc'}],
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" sx={{mb: 2,}}>User Data Export</Typography>
                <UserDataExportForm users={users}/>
            </CardContent>
        </Card>
    );
}
