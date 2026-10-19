import React from 'react';
import {Button, Card, CardContent, Stack, Typography} from "@mui/material";
import Link from "next/link";
import {Add} from "@mui/icons-material";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth/auth";
import ProgressionAssignmentsTable from "@/components/ProgressionAssignment/ProgressionAssignmentsTable";

export default async function Page() {

    const session = await getServerSession(authOptions);

    return (
        <Card>
            <CardContent>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        justifyContent: "space-between",
                        mb: 2
                    }}>
                    <Stack direction="column" spacing={1}>
                        <Typography variant="h5">Progression Assignments</Typography>
                    </Stack>
                    {session?.user.roles.includes("STAFF") && <Link href="/training/progressions/assignments/new">
                        <Button variant="contained" size="large" startIcon={<Add/>}>Assign Progression</Button>
                    </Link>}
                </Stack>
                <ProgressionAssignmentsTable allowEdit={!!session?.user.roles.includes("STAFF")}/>
            </CardContent>
        </Card>
    );

}